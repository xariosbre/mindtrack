from app.utils.database import execute_query
from app.models.habit import HabitRecord
from app.models.mood import MoodAssessment
from datetime import date, timedelta

class ReportService:
    """
    Serviço para gerar relatórios e resumos de hábitos e humor.
    Atende às HUs 08 (Dashboard) e 10 (Relatórios de Correlação).
    """

    @staticmethod
    def get_dashboard_summary(user_id, start_date, end_date):
        """
        HU08 - Gera um resumo semanal de hábitos e humor para o dashboard.
        Retorna dados para gráficos de linha (humor) e barras (hábitos).
        """
        
        # 1. Dados de Humor Diário
        mood_data = MoodAssessment.get_all_by_user_and_date_range(user_id, start_date, end_date)
        
        # 2. Dados de Hábitos Diários
        habit_records = HabitRecord.get_all_by_user_and_date_range(user_id, start_date, end_date)

        # Agregação de dados para os gráficos
        daily_mood_scores = {}
        for m in mood_data:
            # Garante que a data seja uma string 'YYYY-MM-DD'
            dt = m['data_avaliacao'].isoformat() if isinstance(m['data_avaliacao'], (date, datetime)) else m['data_avaliacao']
            daily_mood_scores[dt] = m['nota_humor']

        daily_habit_completion = {} # { 'YYYY-MM-DD': { 'habit_id': { 'completed': True/False, 'value': X } } }
        for hr in habit_records:
            dt = hr['data_registro'].isoformat() if isinstance(hr['data_registro'], (date, datetime)) else hr['data_registro']
            if dt not in daily_habit_completion:
                daily_habit_completion[dt] = {}
            daily_habit_completion[dt][hr['habito_id']] = {
                'concluido': hr['concluido'],
                'valor': hr['valor'],
                'nome': hr['habito_nome'] # Adiciona o nome do hábito
            }

        # Gera uma lista de datas para o período para garantir que todas as datas sejam representadas
        all_dates_in_range = []
        current_date = start_date
        while current_date <= end_date:
            all_dates_in_range.append(current_date.isoformat())
            current_date += timedelta(days=1)

        # Formata dados para gráficos de linha e barras
        # Gráfico de Humor (linha)
        mood_chart_data = {
            'labels': all_dates_in_range,
            'datasets': [{
                'label': 'Humor Diário',
                'data': [daily_mood_scores.get(d, None) for d in all_dates_in_range], # None para dias sem registro
                'fill': False,
                'borderColor': 'rgb(75, 192, 192)',
                'tension': 0.1
            }]
        }

        # Gráfico de Hábitos (barras - exemplo de média de conclusão ou somatória)
        # Mais complexo, pode precisar de um dataset por hábito ou uma média geral
        # Vamos fazer um exemplo de % de hábitos concluídos por dia
        daily_completion_percentage = []
        for d_str in all_dates_in_range:
            day_records = daily_habit_completion.get(d_str, {})
            if day_records:
                completed_count = sum(1 for rec in day_records.values() if rec['concluido'])
                total_habits_on_day = len(day_records)
                percentage = (completed_count / total_habits_on_day) * 100 if total_habits_on_day > 0 else 0
                daily_completion_percentage.append(round(percentage, 2))
            else:
                daily_completion_percentage.append(0) # Sem hábitos registrados no dia

        habit_completion_chart_data = {
            'labels': all_dates_in_range,
            'datasets': [{
                'label': '% Hábitos Concluídos',
                'data': daily_completion_percentage,
                'backgroundColor': 'rgba(54, 162, 235, 0.6)',
                'borderColor': 'rgba(54, 162, 235, 1)',
                'borderWidth': 1
            }]
        }

        # Você pode adicionar mais métricas e dados conforme necessário para o dashboard,
        # como streaks, hábitos mais praticados, etc.
        
        return {
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'mood_summary': mood_chart_data,
            'habit_completion_summary': habit_completion_chart_data,
            # 'raw_habit_records': habit_records, # Opcional: retornar dados brutos também
            # 'raw_mood_data': mood_data, # Opcional
        }


    @staticmethod
    def get_correlation_report(user_id, start_date, end_date, habit_ids):
        """
        HU10 - Gera um relatório de correlação entre hábitos específicos e humor.
        Utiliza a view v_correlacao_humor_habitos.
        """
        # Obter dados da view de correlação
        # É importante filtrar pelos IDs dos hábitos que o usuário quer correlacionar
        if not habit_ids:
            # Se nenhum habit_id for fornecido, talvez retornar um erro ou um relatório vazio
            return {'error': 'Pelo menos um ID de hábito deve ser fornecido para a correlação.'}

        # Converte a lista de IDs para uma string para a cláusula IN
        habit_ids_str = ','.join(map(str, habit_ids))

        query = f"""
            SELECT
                data_registro,
                nota_humor,
                habito_nome,
                valor_habito,
                concluido
            FROM v_correlacao_humor_habitos
            WHERE usuario_id = %s
            AND data_registro BETWEEN %s AND %s
            AND habito_id IN ({habit_ids_str})
            ORDER BY data_registro ASC, habito_nome ASC
        """
        params = (user_id, start_date, end_date)
        
        raw_correlation_data = execute_query(query, params, fetch=True)

        if not raw_correlation_data:
            return {
                'message': 'Nenhum dado encontrado para os critérios selecionados.',
                'chart_data': {},
                'summary': {}
            }
        
        # Processar dados para visualização de correlação (ex: scatter plot ou análise estatística)
        processed_data = {} # Ex: { 'data': [...], 'humor': [...], 'habitoX': [...] }
        daily_aggregated_data = {} # Agrega por dia

        for row in raw_correlation_data:
            dt = row['data_registro'].isoformat()
            if dt not in daily_aggregated_data:
                daily_aggregated_data[dt] = {'nota_humor': row['nota_humor'], 'habits': {}}
            daily_aggregated_data[dt]['habits'][row['habito_nome']] = {
                'valor': float(row['valor_habito']),
                'concluido': bool(row['concluido'])
            }
        
        # Formatar para gráficos (ex: para Chart.js)
        labels = sorted(list(daily_aggregated_data.keys()))
        humor_scores = [daily_aggregated_data[dt]['nota_humor'] for dt in labels]
        
        habit_datasets = {}
        for habit_id in habit_ids:
            # Buscar o nome do hábito para o rótulo
            from app.models.habit import Habit
            habit = Habit.get_by_id(habit_id, user_id)
            if habit:
                habit_name = habit.nome
                habit_datasets[habit_name] = []
                for dt in labels:
                    daily_habits = daily_aggregated_data[dt]['habits']
                    # Se o hábito foi registrado naquele dia, pegue o valor, senão 0 ou None
                    val = daily_habits.get(habit_name, {}).get('valor', 0)
                    habit_datasets[habit_name].append(val)
        
        chart_datasets = [{
            'label': 'Humor Diário',
            'data': humor_scores,
            'borderColor': 'rgb(255, 99, 132)',
            'backgroundColor': 'rgba(255, 99, 132, 0.5)',
            'yAxisID': 'y1' # Eixo Y para humor
        }]
        
        color_index = 0
        colors = ['rgb(54, 162, 235)', 'rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(153, 102, 255)'] # Mais cores
        for habit_name, data_values in habit_datasets.items():
            chart_datasets.append({
                'label': f'Hábito: {habit_name}',
                'data': data_values,
                'borderColor': colors[color_index % len(colors)],
                'backgroundColor': colors[color_index % len(colors)].replace('rgb', 'rgba').replace(')', ', 0.5)'),
                'yAxisID': 'y2', # Eixo Y para hábitos
                'type': 'bar' # Pode ser barra para hábitos
            })
            color_index += 1

        chart_data = {
            'labels': labels,
            'datasets': chart_datasets
        }

        # Análise de correlação simples (ex: média de humor quando hábito concluído vs não concluído)
        summary_analysis = {}
        for habit_id in habit_ids:
            habit_name = Habit.get_by_id(habit_id, user_id).nome if Habit.get_by_id(habit_id, user_id) else f"Hábito ID {habit_id}"
            mood_on_completed = []
            mood_on_not_completed = []
            
            for row in raw_correlation_data:
                if row['habito_nome'] == habit_name:
                    if row['concluido']:
                        mood_on_completed.append(row['nota_humor'])
                    else:
                        mood_on_not_completed.append(row['nota_humor'])
            
            avg_mood_completed = sum(mood_on_completed) / len(mood_on_completed) if mood_on_completed else 0
            avg_mood_not_completed = sum(mood_on_not_completed) / len(mood_on_not_completed) if mood_on_not_completed else 0

            summary_analysis[habit_name] = {
                'media_humor_quando_concluido': round(avg_mood_completed, 2),
                'media_humor_quando_nao_concluido': round(avg_mood_not_completed, 2),
                'total_registros_concluidos': len(mood_on_completed),
                'total_registros_nao_concluidos': len(mood_on_not_completed)
            }


        return {
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'chart_data': chart_data,
            'summary_analysis': summary_analysis,
            'raw_data_count': len(raw_correlation_data)
        }

    @staticmethod
    def get_daily_consolidated_data(user_id, start_date, end_date):
        """
        Retorna dados consolidados de hábitos e humor para cada dia no período.
        Útil para visualizações de calendário e dashboards detalhados.
        """
        daily_data = {}
        
        # 1. Obter todas as datas no intervalo
        current_date = start_date
        while current_date <= end_date:
            daily_data[current_date.isoformat()] = {
                'date': current_date.isoformat(),
                'mood': None,
                'habits': []
            }
            current_date += timedelta(days=1)
        
        # 2. Inserir dados de humor
        mood_assessments = MoodAssessment.get_all_by_user_and_date_range(user_id, start_date, end_date)
        for mood in mood_assessments:
            dt_str = mood['data_avaliacao'].isoformat() if isinstance(mood['data_avaliacao'], (date, datetime)) else mood['data_avaliacao']
            if dt_str in daily_data:
                daily_data[dt_str]['mood'] = mood['nota_humor']
        
        # 3. Inserir dados de hábitos
        habit_records = HabitRecord.get_all_by_user_and_date_range(user_id, start_date, end_date)
        for record in habit_records:
            dt_str = record['data_registro'].isoformat() if isinstance(record['data_registro'], (date, datetime)) else record['data_registro']
            if dt_str in daily_data:
                daily_data[dt_str]['habits'].append({
                    'id': record['habito_id'],
                    'nome': record['habito_nome'],
                    'valor': record['valor'],
                    'concluido': record['concluido'],
                    'tipo_medicao': record['tipo_medicao'],
                    'unidade': record['unidade'],
                    'meta_diaria': record['meta_diaria']
                })
        
        # Converter o dicionário de volta para uma lista ordenada por data
        sorted_daily_data = sorted(daily_data.values(), key=lambda x: x['date'])
        return sorted_daily_data