from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.goal import Goal
from datetime import date

goal_bp = Blueprint('goal', __name__)

@goal_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    """HU09 - Definir uma nova meta personalizada."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['titulo', 'tipo_meta', 'valor_meta', 'data_inicio']
    for field in required_fields:
        if not data.get(field) is not None:
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    tipo_meta = data['tipo_meta']
    if tipo_meta not in ['habito', 'humor', 'custom']:
        return jsonify({'error': 'Tipo de meta inválido. Deve ser "habito", "humor" ou "custom".'}), 400

    if tipo_meta == 'habito' and not data.get('habito_id'):
        return jsonify({'error': 'Para meta de hábito, habito_id é obrigatório.'}), 400

    try:
        new_goal = Goal(
            id=None,
            usuario_id=current_user_id,
            titulo=data['titulo'].strip(),
            descricao=data.get('descricao', '').strip(),
            habito_id=data.get('habito_id'),
            tipo_meta=tipo_meta,
            valor_meta=data['valor_meta'],
            periodo=data.get('periodo', 'diario'),
            data_inicio=data['data_inicio'],
            data_fim=data.get('data_fim'),
            ativa=data.get('ativa', True),
            notificacoes=data.get('notificacoes', True)
        )
        new_goal.save()
        return jsonify({
            'message': 'Meta criada com sucesso!',
            'goal': new_goal.to_dict()
        }), 201
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD para data_inicio e data_fim.'}), 400
    except Exception as e:
        print(f"Erro ao criar meta: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@goal_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_goals():
    """HU09 - Listar todas as metas do usuário autenticado."""
    current_user_id = get_jwt_identity()
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    try:
        goals = Goal.get_all_by_user(current_user_id, include_inactive)
        return jsonify(goals), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao listar metas: {str(e)}'}), 500

@goal_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    """HU09 - Atualizar uma meta existente."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    goal = Goal.get_by_id(goal_id, current_user_id)
    if not goal:
        return jsonify({'error': 'Meta não encontrada ou não pertence ao usuário.'}), 404
    
    # Atualiza campos se fornecidos
    if 'titulo' in data and data['titulo'].strip() != "":
        goal.titulo = data['titulo'].strip()
    if 'descricao' in data:
        goal.descricao = data['descricao'].strip()
    if 'habito_id' in data:
        goal.habito_id = data['habito_id']
    if 'tipo_meta' in data:
        if data['tipo_meta'] not in ['habito', 'humor', 'custom']:
            return jsonify({'error': 'Tipo de meta inválido.'}), 400
        goal.tipo_meta = data['tipo_meta']
    if 'valor_meta' in data:
        goal.valor_meta = data['valor_meta']
    if 'periodo' in data:
        goal.periodo = data['periodo']
    if 'data_inicio' in data:
        try:
            goal.data_inicio = date.fromisoformat(data['data_inicio'])
        except ValueError:
            return jsonify({'error': 'Formato de data_inicio inválido. Use YYYY-MM-DD.'}), 400
    if 'data_fim' in data:
        try:
            goal.data_fim = date.fromisoformat(data['data_fim']) if data['data_fim'] else None
        except ValueError:
            return jsonify({'error': 'Formato de data_fim inválido. Use YYYY-MM-DD.'}), 400
    if 'ativa' in data:
        goal.ativa = bool(data['ativa'])
    if 'notificacoes' in data:
        goal.notificacoes = bool(data['notificacoes'])

    try:
        goal.save()
        return jsonify({
            'message': 'Meta atualizada com sucesso!',
            'goal': goal.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar meta: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@goal_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """HU09 - Desativar (exclusão lógica) uma meta."""
    current_user_id = get_jwt_identity()
    goal = Goal.get_by_id(goal_id, current_user_id)

    if not goal:
        return jsonify({'error': 'Meta não encontrada ou não pertence ao usuário.'}), 404
    
    try:
        goal.delete() # Chama o método de exclusão lógica
        return jsonify({'message': 'Meta desativada com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao desativar meta: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500