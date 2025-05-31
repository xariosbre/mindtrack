from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def admin_required(fn):
    """
    Decorator que verifica se o usuário autenticado é um administrador.
    HU05 - Perfis de Acesso Diferenciados.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.get_by_id(current_user_id)
        
        if user and user.tipo_usuario == 'admin':
            return fn(*args, **kwargs)
        else:
            return jsonify({'error': 'Acesso negado: Requer privilégios de administrador.'}), 403
    return wrapper

def permission_required(permission_name):
    """
    Decorator mais genérico para verificar permissões específicas.
    Exemplo: @permission_required('can_edit_habits')
    Pode ser estendido para um sistema de permissões mais granular.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.get_by_id(current_user_id)
            
            # Lógica para verificar a permissão:
            # Neste exemplo simples, só o admin tem todas as permissões.
            # Em um sistema mais complexo, você teria uma tabela de permissões.
            if user and user.tipo_usuario == 'admin': # Admins têm todas as permissões
                return fn(*args, **kwargs)
            
            # Aqui você implementaria a lógica para verificar 'permission_name'
            # para usuários regulares, se aplicável.
            # Por enquanto, se não for admin, e precisar de permissão específica, negamos.
            return jsonify({'error': f'Acesso negado: Requer permissão "{permission_name}".'}), 403
        return wrapper
    return decorator