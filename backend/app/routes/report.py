from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.report_service import ReportService
from datetime import date, timedelta

report_bp = Blueprint('report', __name__)

@report_bp.route('/dashboard_summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """HU08 - Resumo semanal de hábitos e humor para o dashboard."""
    current_user_id = get_jwt_identity()
    
    # Define o período padrão para a última semana
    today = date.today()
    one_week_ago = today - timedelta(days=6) # Últimos 7 dias, incluindo hoje

    start_date_str = request.args.get('start_date', one_week_ago.isoformat())
    end_date_str = request.args.get('end_date', today.isoformat())

    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
        
        summary = ReportService.get_dashboard_summary(current_user_id, start_date, end_date)
        return jsonify(summary), 200
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    except Exception as e:
        print(f"Erro ao gerar resumo do dashboard: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@report_bp.route('/correlation_report', methods=['GET'])
@jwt_required()
def get_correlation_report():
    """HU10 - Gerar relatórios gráficos de correlação entre hábitos e humor."""
    current_user_id = get_jwt_identity()
    
    # Parâmetros obrigatórios para o relatório de correlação
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    habit_ids_str = request.args.get('habit_ids') # Ex: "1,2,5"

    if not all([start_date_str, end_date_str, habit_ids_str]):
        return jsonify({'error': 'Parâmetros start_date, end_date e habit_ids são obrigatórios.'}), 400

    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
        habit_ids = [int(hid) for hid in habit_ids_str.split(',')]

        report_data = ReportService.get_correlation_report(current_user_id, start_date, end_date, habit_ids)
        return jsonify(report_data), 200
    except ValueError:
        return jsonify({'error': 'Formato de data ou IDs de hábitos inválidos.'}), 400
    except Exception as e:
        print(f"Erro ao gerar relatório de correlação: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

# Rota para dados brutos do calendário/dias (útil para dashboards)
@report_bp.route('/daily_data', methods=['GET'])
@jwt_required()
def get_daily_data():
    """Obter dados diários consolidados (hábitos e humor) para um período."""
    current_user_id = get_jwt_identity()
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({'error': 'Parâmetros start_date e end_date são obrigatórios.'}), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
        
        daily_data = ReportService.get_daily_consolidated_data(current_user_id, start_date, end_date)
        return jsonify(daily_data), 200
    except ValueError:
        return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    except Exception as e:
        print(f"Erro ao buscar dados diários consolidados: {e}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500