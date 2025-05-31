from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, set_access_cookies
import bcrypt
import uuid
from datetime import datetime, timedelta
from app.utils.database import execute_query
from app.services.email_service import send_password_reset_email
from app.models.user import User # Importa o modelo User
from app.config import Config
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Valida formato do email."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Valida se a senha tem pelo menos 6 caracteres."""
    return len(password) >= 6

@auth_bp.route('/register', methods=['POST'])
def register():
    """HU01 - Cadastro de Usuários."""
    try:
        data = request.get_json()

        # Validações de campos obrigatórios
        required_fields = ['nome', 'email', 'senha', 'confirmar_senha']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400

        nome = data['nome'].strip()
        email = data['email'].strip().lower()
        senha = data['senha']
        confirmar_senha = data['confirmar_senha']

        # Validar email
        if not validate_email(email):
            return jsonify({'error': 'Email inválido'}), 400

        # Validar senha
        if not validate_password(senha):
            return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400

        # Verificar se senhas coincidem
        if senha != confirmar_senha:
            return jsonify({'error': 'Senhas não coincidem'}), 400

        # Verificar se email já existe
        existing_user = User.get_by_email(email)
        if existing_user:
            return jsonify({'error': 'Email já cadastrado'}), 400

        # Hash da senha
        hashed_password = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt(rounds=12)) # Aumentar rounds para segurança
        
        # Criar instância do modelo User
        new_user = User(
            id=None, # ID será gerado pelo BD
            nome=nome,
            email=email,
            senha=hashed_password.decode('utf-8'),
            tipo_usuario='usuario'
        )
        
        user_id = new_user.save() # Salva no banco de dados

        # Criar token de acesso
        access_token = create_access_token(identity=user_id)
        
        response = jsonify({
            'message': 'Usuário cadastrado com sucesso!',
            'user': new_user.to_dict(), # Retorna os dados do usuário
            'access_token': access_token
        })
        set_access_cookies(response, access_token) # Define cookie HTTP-only
        return response, 201

    except Exception as e:
        print(f"Erro no registro: {e}") # Para depuração
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """HU02 - Sistema de Autenticação."""
    try:
        data = request.get_json()

        if not data.get('email') or not data.get('senha'):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400

        email = data['email'].strip().lower()
        senha = data['senha']

        # Buscar usuário pelo email usando o modelo
        user = User.get_by_email(email)

        if not user:
            return jsonify({'error': 'Email ou senha inválidos'}), 401
        
        # Verificar se usuário está ativo
        if not user.ativo:
            return jsonify({'error': 'Usuário desativado. Contate o administrador.'}), 401

        # Verificar senha
        if not bcrypt.checkpw(senha.encode('utf-8'), user.senha.encode('utf-8')):
            return jsonify({'error': 'Email ou senha inválidos'}), 401

        # Criar token de acesso
        access_token = create_access_token(identity=user.id)
        
        # Registrar sessão (opcional, pode ser feito com JWT)
        # Este trecho é útil se você quer rastrear sessões ativas no DB
        execute_query(
            """INSERT INTO sessoes (usuario_id, token, ip_address, user_agent, data_expiracao)
                VALUES (%s, %s, %s, %s, %s)""",
            (
                user.id,
                access_token[:50],  # Apenas parte do token para identificação
                request.remote_addr,
                request.headers.get('User-Agent', ''),
                datetime.now() + Config.JWT_ACCESS_TOKEN_EXPIRES # Usa o tempo de expiração do JWT
            )
        )

        response = jsonify({
            'message': 'Login bem-sucedido!',
            'user': user.to_dict(),
            'access_token': access_token
        })
        set_access_cookies(response, access_token) # Define cookie HTTP-only
        return response, 200

    except Exception as e:
        print(f"Erro no login: {e}") # Para depuração
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required() # Requer token JWT válido
def logout():
    """Desloga o usuário, invalidando a sessão no backend (se houver) e removendo cookies."""
    current_user_id = get_jwt_identity()

    # Opcional: invalidar a sessão no banco de dados se estiver sendo rastreada
    execute_query("UPDATE sessoes SET ativa = FALSE WHERE usuario_id = %s AND ativa = TRUE", (current_user_id,))

    response = jsonify({'message': 'Logout bem-sucedido!'})
    unset_jwt_cookies(response) # Remove o cookie JWT
    return response, 200


@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    """HU03 - Recuperação de Senha (Solicitação de Redefinição)."""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'error': 'Email é obrigatório'}), 400

        user = User.get_by_email(email)

        if not user:
            # Para segurança, não informamos se o email não existe.
            # A mensagem de sucesso é genérica.
            return jsonify({'message': 'Se o email estiver cadastrado, um link de redefinição será enviado.'}), 200

        # Gerar token único de redefinição
        reset_token = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(hours=1) # Token válido por 1 hora

        # Salvar token no banco de dados
        execute_query(
            """INSERT INTO tokens_recuperacao (usuario_id, token, data_expiracao)
                VALUES (%s, %s, %s)""",
            (user.id, reset_token, expires_at)
        )

        # Enviar email com link de redefinição
        reset_link = f"{Config.FRONTEND_URL}/reset-password/{reset_token}"
        send_password_reset_email(user.email, reset_link, user.nome)

        return jsonify({'message': 'Se o email estiver cadastrado, um link de redefinição será enviado.'}), 200

    except Exception as e:
        print(f"Erro na recuperação de senha: {e}") # Para depuração
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@auth_bp.route('/reset_password', methods=['POST'])
def reset_password():
    """HU03 - Recuperação de Senha (Redefinição efetiva)."""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if not all([token, new_password, confirm_password]):
            return jsonify({'error': 'Token, nova senha e confirmação de senha são obrigatórios'}), 400

        if new_password != confirm_password:
            return jsonify({'error': 'Nova senha e confirmação de senha não coincidem'}), 400

        if not validate_password(new_password):
            return jsonify({'error': 'A nova senha deve ter pelo menos 6 caracteres'}), 400

        # Buscar token no banco de dados
        reset_token_record = execute_query(
            "SELECT * FROM tokens_recuperacao WHERE token = %s AND usado = FALSE AND data_expiracao > NOW()",
            (token,),
            fetch=True
        )

        if not reset_token_record:
            return jsonify({'error': 'Link de redefinição inválido ou expirado.'}), 400

        reset_token_record = reset_token_record[0]
        user_id = reset_token_record['usuario_id']

        # Atualizar a senha do usuário
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(rounds=12))
        execute_query("UPDATE usuarios SET senha = %s WHERE id = %s", (hashed_password.decode('utf-8'), user_id))

        # Marcar token como usado
        execute_query("UPDATE tokens_recuperacao SET usado = TRUE WHERE id = %s", (reset_token_record['id'],))

        return jsonify({'message': 'Senha redefinida com sucesso!'}), 200

    except Exception as e:
        print(f"Erro na redefinição de senha: {e}") # Para depuração
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para verificar se o token JWT é válido (útil para manter sessão)
@auth_bp.route('/verify_token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verifica a validade do token JWT e retorna informações básicas do usuário."""
    current_user_id = get_jwt_identity()
    user = User.get_by_id(current_user_id)
    if user:
        return jsonify({
            'message': 'Token válido',
            'user': user.to_dict() # Retorna dados do usuário para o frontend
        }), 200
    return jsonify({'message': 'Token inválido ou usuário não encontrado'}), 401