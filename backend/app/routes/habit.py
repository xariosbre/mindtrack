from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.habit import Habit, HabitRecord, HabitCategory
from datetime import date

habit_bp = Blueprint('habit', __name__)

@habit_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_habit_categories():
    """Obter todas as categorias de hábitos."""
    try:
        categories = HabitCategory.get_all_categories()
        return jsonify([c.to_dict() for c in categories]), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar categorias: {str(e)}'}), 500

@habit_bp.route('/', methods=['POST'])
@jwt_required()
def create_habit():
    """HU06 - Criar um novo hábito."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['nome', 'categoria_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    # Validações adicionais (ex: categoria_id existe)
    # Por simplicidade, assumimos que a categoria_id sempre será válida por vir da lista de categorias
    # Em um sistema robusto, você faria uma query para verificar se a categoria existe.

    try:
        new_habit = Habit(
            id=None,
            usuario_id=current_user_id,
            nome=data['nome'].strip(),
            descricao=data.get('descricao', '').strip(),
            categoria_id=data['categoria_id'],
            tipo_medicao=data.get('tipo_medicao', 'boolean'),
            unidade=data.get('unidade'),
            meta_diaria=data.get('meta_diaria')
        )
        new_habit.save()
        
        # Recuperar o hábito salvo com nome da categoria para o frontend
        from app.utils.database import execute_query
        query = "SELECT h.*, ch.nome AS categoria_nome FROM habitos h JOIN categorias_habitos ch ON h.categoria_id = ch.id WHERE h.id = %s"
        saved_habit_data = execute_query(query, (new_habit.id,), fetch=True)
        
        if saved_habit_data:
            response_habit = {**new_habit.to_dict(), 'categoria_nome': saved_habit_data[0]['categoria_nome']}
            return jsonify({
                'message': 'Hábito criado com sucesso!',
                'habit': response_habit
            }), 201
        else:
            return jsonify({'error': 'Hábito criado mas não recuperado para resposta.'}), 500

    except Exception as e:
        print(f"Erro ao criar hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@habit_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_habits():
    """HU06 - Listar todos os hábitos do usuário autenticado."""
    current_user_id = get_jwt_identity()
    try:
        habits = Habit.get_all_by_user(current_user_id)
        return jsonify(habits), 200
    except Exception as e:
        return jsonify({'error': f'Erro ao listar hábitos: {str(e)}'}), 500

@habit_bp.route('/<int:habit_id>', methods=['PUT'])
@jwt_required()
def update_habit(habit_id):
    """HU11 - Editar um hábito existente."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    habit = Habit.get_by_id(habit_id, current_user_id)
    if not habit:
        return jsonify({'error': 'Hábito não encontrado ou não pertence ao usuário.'}), 404
    
    # Atualiza campos se fornecidos
    if 'nome' in data and data['nome'].strip() != "":
        habit.nome = data['nome'].strip()
    if 'descricao' in data: # Pode ser uma string vazia para limpar
        habit.descricao = data['descricao'].strip()
    if 'categoria_id' in data:
        habit.categoria_id = data['categoria_id']
    if 'tipo_medicao' in data:
        habit.tipo_medicao = data['tipo_medicao']
    if 'unidade' in data:
        habit.unidade = data['unidade']
    if 'meta_diaria' in data:
        habit.meta_diaria = data['meta_diaria']
    if 'ativo' in data:
        habit.ativo = bool(data['ativo'])

    try:
        habit.save()
        # Recuperar o hábito salvo com nome da categoria para o frontend
        from app.utils.database import execute_query
        query = "SELECT h.*, ch.nome AS categoria_nome FROM habitos h JOIN categorias_habitos ch ON h.categoria_id = ch.id WHERE h.id = %s"
        updated_habit_data = execute_query(query, (habit.id,), fetch=True)
        
        if updated_habit_data:
            response_habit = {**habit.to_dict(), 'categoria_nome': updated_habit_data[0]['categoria_nome']}
            return jsonify({
                'message': 'Hábito atualizado com sucesso!',
                'habit': response_habit
            }), 200
        else:
            return jsonify({'error': 'Hábito atualizado mas não recuperado para resposta.'}), 500

    except Exception as e:
        print(f"Erro ao atualizar hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@habit_bp.route('/<int:habit_id>', methods=['DELETE'])
@jwt_required()
def delete_habit(habit_id):
    """HU12 - Excluir um hábito (exclusão lógica)."""
    current_user_id = get_jwt_identity()
    habit = Habit.get_by_id(habit_id, current_user_id)

    if not habit:
        return jsonify({'error': 'Hábito não encontrado ou não pertence ao usuário.'}), 404
    
    try:
        habit.delete() # Chama o método de exclusão lógica
        return jsonify({'message': 'Hábito desativado com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao desativar hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500


# Rotas para Registros de Hábitos (HU06, HU11, HU12)
@habit_bp.route('/<int:habit_id>/records', methods=['POST'])
@jwt_required()
def add_habit_record(habit_id):
    """HU06 - Adicionar um registro para um hábito específico."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    habit = Habit.get_by_id(habit_id, current_user_id)
    if not habit:
        return jsonify({'error': 'Hábito não encontrado ou não pertence ao usuário.'}), 404

    # Data do registro (padrão é hoje)
    record_date_str = data.get('data_registro', date.today().isoformat())
    valor = data.get('valor', 0.0)
    concluido = data.get('concluido', False)
    observacoes = data.get('observacoes')

    # Verificar se já existe um registro para este hábito nesta data
    existing_record = HabitRecord.get_by_habit_and_date(habit_id, current_user_id, record_date_str)
    if existing_record:
        return jsonify({'error': 'Já existe um registro para este hábito nesta data. Use PUT para atualizar.'}), 409 # Conflict

    try:
        new_record = HabitRecord(
            id=None,
            habito_id=habit_id,
            usuario_id=current_user_id,
            data_registro=record_date_str,
            valor=valor,
            concluido=concluido,
            observacoes=observacoes
        )
        new_record.save()
        return jsonify({
            'message': 'Registro de hábito adicionado com sucesso!',
            'record': new_record.to_dict()
        }), 201
    except Exception as e:
        print(f"Erro ao adicionar registro de hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500


@habit_bp.route('/records/<int:record_id>', methods=['PUT'])
@jwt_required()
def update_habit_record(record_id):
    """HU11 - Atualizar um registro de hábito existente."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    record = HabitRecord.get_by_id(record_id, current_user_id)
    if not record:
        return jsonify({'error': 'Registro de hábito não encontrado ou não pertence ao usuário.'}), 404
    
    # Atualiza campos se fornecidos
    if 'valor' in data:
        record.valor = data['valor']
    if 'concluido' in data:
        record.concluido = bool(data['concluido'])
    if 'observacoes' in data:
        record.observacoes = data['observacoes'] # Pode ser None para limpar

    try:
        record.save()
        return jsonify({
            'message': 'Registro de hábito atualizado com sucesso!',
            'record': record.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar registro de hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@habit_bp.route('/records/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_habit_record(record_id):
    """HU12 - Excluir um registro de hábito."""
    current_user_id = get_jwt_identity()
    record = HabitRecord.get_by_id(record_id, current_user_id)

    if not record:
        return jsonify({'error': 'Registro de hábito não encontrado ou não pertence ao usuário.'}), 404
    
    try:
        record.delete()
        return jsonify({'message': 'Registro de hábito excluído com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao excluir registro de hábito: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@habit_bp.route('/records/by_date_range', methods=['GET'])
@jwt_required()
def get_records_by_date_range():
    """Listar registros de hábitos de um usuário em um intervalo de datas."""
    current_user_id = get_jwt_identity()
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({'error': 'Parâmetros start_date e end_date são obrigatórios.'}), 400
    
    try:
        # Valida as datas
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
        
        records = HabitRecord.get_all_by_user_and_date_range(current_user_id, start_date, end_date)
        return jsonify(records), 200
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    except Exception as e:
        print(f"Erro ao buscar registros por data: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500