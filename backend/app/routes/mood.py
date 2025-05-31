from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.mood import MoodAssessment
from datetime import date

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/', methods=['POST'])
@jwt_required()
def add_mood_assessment():
    """HU07 - Avaliar o humor diário."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['nota_humor']
    for field in required_fields:
        if not data.get(field) is not None: # check for 0
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400

    nota_humor = data['nota_humor']
    if not (1 <= nota_humor <= 5):
        return jsonify({'error': 'Nota de humor deve ser entre 1 e 5.'}), 400
    
    # Data da avaliação (padrão é hoje)
    assessment_date_str = data.get('data_avaliacao', date.today().isoformat())
    observacoes = data.get('observacoes')

    # Verificar se já existe uma avaliação para este usuário nesta data
    existing_assessment = MoodAssessment.get_by_user_and_date(current_user_id, assessment_date_str)
    if existing_assessment:
        return jsonify({'error': 'Já existe uma avaliação de humor para esta data. Use PUT para atualizar.'}), 409 # Conflict

    try:
        new_assessment = MoodAssessment(
            id=None,
            usuario_id=current_user_id,
            data_avaliacao=assessment_date_str,
            nota_humor=nota_humor,
            observacoes=observacoes
        )
        new_assessment.save()
        return jsonify({
            'message': 'Avaliação de humor adicionada com sucesso!',
            'assessment': new_assessment.to_dict()
        }), 201
    except Exception as e:
        print(f"Erro ao adicionar avaliação de humor: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@mood_bp.route('/<int:assessment_id>', methods=['PUT'])
@jwt_required()
def update_mood_assessment(assessment_id):
    """HU13 - Atualizar uma avaliação de humor existente."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    assessment = MoodAssessment.get_by_id(assessment_id, current_user_id)
    if not assessment:
        return jsonify({'error': 'Avaliação de humor não encontrada ou não pertence ao usuário.'}), 404
    
    if 'nota_humor' in data:
        nota_humor = data['nota_humor']
        if not (1 <= nota_humor <= 5):
            return jsonify({'error': 'Nota de humor deve ser entre 1 e 5.'}), 400
        assessment.nota_humor = nota_humor
    
    if 'observacoes' in data:
        assessment.observacoes = data['observacoes'] # Pode ser None para limpar

    try:
        assessment.save()
        return jsonify({
            'message': 'Avaliação de humor atualizada com sucesso!',
            'assessment': assessment.to_dict()
        }), 200
    except Exception as e:
        print(f"Erro ao atualizar avaliação de humor: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@mood_bp.route('/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_mood_assessment(assessment_id):
    """HU14 - Remover uma avaliação de humor."""
    current_user_id = get_jwt_identity()
    assessment = MoodAssessment.get_by_id(assessment_id, current_user_id)

    if not assessment:
        return jsonify({'error': 'Avaliação de humor não encontrada ou não pertence ao usuário.'}), 404
    
    try:
        assessment.delete()
        return jsonify({'message': 'Avaliação de humor excluída com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao excluir avaliação de humor: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@mood_bp.route('/by_date_range', methods=['GET'])
@jwt_required()
def get_mood_by_date_range():
    """Listar avaliações de humor de um usuário em um intervalo de datas."""
    current_user_id = get_jwt_identity()
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({'error': 'Parâmetros start_date e end_date são obrigatórios.'}), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
        
        mood_assessments = MoodAssessment.get_all_by_user_and_date_range(current_user_id, start_date, end_date)
        return jsonify(mood_assessments), 200
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    except Exception as e:
        print(f"Erro ao buscar avaliações de humor por data: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500