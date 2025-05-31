from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.decorators import admin_required, permission_required
from app.utils.uploads import allowed_file, save_profile_picture
import os

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """HU04 - Obter dados do perfil do usuário autenticado."""
    current_user_id = get_jwt_identity()
    user = User.get_by_id(current_user_id)
    if user:
        return jsonify(user.to_dict()), 200
    return jsonify({'error': 'Usuário não encontrado'}), 404

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """HU04 - Editar informações de perfil do usuário autenticado."""
    current_user_id = get_jwt_identity()
    user = User.get_by_id(current_user_id)

    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404

    data = request.form if request.form else request.get_json() # Suporta form-data (para files) e json
    
    # Atualiza nome e email se fornecidos (e-mail com validação)
    if 'nome' in data and data['nome'].strip() != "":
        user.nome = data['nome'].strip()

    if 'email' in data and data['email'].strip() != "":
        new_email = data['email'].strip().lower()
        if new_email != user.email: # Só valida se o email realmente mudou
            from app.routes.auth import validate_email # Importa a validação de email
            if not validate_email(new_email):
                return jsonify({'error': 'Novo email inválido.'}), 400
            
            # Verifica se o novo email já está em uso por outro usuário
            existing_user_with_new_email = User.get_by_email(new_email)
            if existing_user_with_new_email and existing_user_with_new_email.id != user.id:
                return jsonify({'error': 'Este email já está em uso por outro usuário.'}), 400
            user.email = new_email

    # Lidar com upload de foto de perfil
    if 'foto_perfil' in request.files:
        file = request.files['foto_perfil']
        if file and allowed_file(file.filename):
            try:
                # Salva a nova foto e atualiza o caminho no perfil do usuário
                filename = save_profile_picture(file, user.id)
                user.foto_perfil = filename
            except Exception as e:
                return jsonify({'error': f'Erro ao salvar foto de perfil: {str(e)}'}), 500
        else:
            return jsonify({'error': 'Tipo de arquivo de imagem não permitido.'}), 400
    
    try:
        user.save() # Salva as alterações no banco de dados
        return jsonify({
            'message': 'Perfil atualizado com sucesso!',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({'error': f'Erro interno do servidor ao salvar perfil: {str(e)}'}), 500

@user_bp.route('/admin/users', methods=['GET'])
@jwt_required()
@admin_required # Requer que o usuário logado seja admin
def get_all_users_admin():
    """HU05 - Listar todos os usuários (apenas para administradores)."""
    # Esta função está no service, mas podemos fazer a query direta aqui se preferir simplicidade
    # Ou criar um User.get_all() no modelo
    from app.utils.database import execute_query
    users_data = execute_query("SELECT id, nome, email, tipo_usuario, ativo, foto_perfil FROM usuarios", fetch=True)
    users = [User.from_dict(u).to_dict() for u in users_data] if users_data else []
    return jsonify(users), 200

@user_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required # Requer que o usuário logado seja admin
def update_user_role_admin(user_id):
    """HU05 - Gerenciar níveis de acesso de usuários (apenas para administradores)."""
    data = request.get_json()
    new_role = data.get('tipo_usuario') # 'admin' ou 'usuario'
    is_active = data.get('ativo') # true ou false

    if not any([new_role, is_active is not None]):
        return jsonify({'error': 'Nenhum campo para atualizar fornecido.'}), 400

    user_to_update = User.get_by_id(user_id)
    if not user_to_update:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    # Prevenir que um admin desative ou mude o próprio perfil para não admin
    current_admin_id = get_jwt_identity()
    if user_id == current_admin_id:
        if is_active is False:
            return jsonify({'error': 'Você não pode desativar sua própria conta de administrador.'}), 403
        if new_role and new_role != 'admin':
            return jsonify({'error': 'Você não pode mudar sua própria função de administrador.'}), 403

    if new_role:
        if new_role not in ['admin', 'usuario']:
            return jsonify({'error': 'Tipo de usuário inválido. Deve ser "admin" ou "usuario".'}), 400
        user_to_update.tipo_usuario = new_role
    
    if is_active is not None:
        user_to_update.ativo = bool(is_active)

    try:
        user_to_update.save()
        return jsonify({
            'message': 'Permissões e status do usuário atualizados com sucesso.',
            'user': user_to_update.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar permissões do usuário: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500