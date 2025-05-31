from app.utils.database import execute_query
from datetime import date, datetime

class MoodAssessment:
    """
    Representa uma avaliação de humor diária de um usuário.
    Corresponde à tabela 'avaliacoes_humor'.
    """
    def __init__(self, id, usuario_id, data_avaliacao, nota_humor, observacoes=None, data_criacao=None, data_atualizacao=None):
        self.id = id
        self.usuario_id = usuario_id
        self.data_avaliacao = data_avaliacao # Espera um objeto date ou string 'YYYY-MM-DD'
        self.nota_humor = nota_humor
        self.observacoes = observacoes
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    @staticmethod
    def from_dict(data):
        return MoodAssessment(
            id=data.get('id'),
            usuario_id=data.get('usuario_id'),
            data_avaliacao=data.get('data_avaliacao'),
            nota_humor=data.get('nota_humor'),
            observacoes=data.get('observacoes'),
            data_criacao=data.get('data_criacao'),
            data_atualizacao=data.get('data_atualizacao')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'data_avaliacao': self.data_avaliacao.isoformat() if isinstance(self.data_avaliacao, (date, datetime)) else self.data_avaliacao,
            'nota_humor': self.nota_humor,
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

    @staticmethod
    def get_by_id(mood_id, user_id):
        query = "SELECT * FROM avaliacoes_humor WHERE id = %s AND usuario_id = %s"
        result = execute_query(query, (mood_id, user_id), fetch=True)
        if result:
            return MoodAssessment.from_dict(result[0])
        return None

    @staticmethod
    def get_by_user_and_date(user_id, date_str):
        query = "SELECT * FROM avaliacoes_humor WHERE usuario_id = %s AND data_avaliacao = %s"
        result = execute_query(query, (user_id, date_str), fetch=True)
        if result:
            return MoodAssessment.from_dict(result[0])
        return None

    @staticmethod
    def get_all_by_user_and_date_range(user_id, start_date, end_date):
        query = """
            SELECT * FROM avaliacoes_humor
            WHERE usuario_id = %s AND data_avaliacao BETWEEN %s AND %s
            ORDER BY data_avaliacao ASC
        """
        results = execute_query(query, (user_id, start_date, end_date), fetch=True)
        return [MoodAssessment.from_dict(r).to_dict() for r in results] if results else []

    def save(self):
        if isinstance(self.data_avaliacao, str):
            self.data_avaliacao = date.fromisoformat(self.data_avaliacao)

        if self.id: # Atualizar
            query = """
                UPDATE avaliacoes_humor SET nota_humor = %s, observacoes = %s
                WHERE id = %s AND usuario_id = %s
            """
            params = (self.nota_humor, self.observacoes, self.id, self.usuario_id)
            execute_query(query, params)
        else: # Inserir
            query = """
                INSERT INTO avaliacoes_humor (usuario_id, data_avaliacao, nota_humor, observacoes)
                VALUES (%s, %s, %s, %s)
            """
            params = (self.usuario_id, self.data_avaliacao, self.nota_humor, self.observacoes)
            self.id = execute_query(query, params)
        return self.id

    def delete(self):
        """Exclui uma avaliação de humor."""
        query = "DELETE FROM avaliacoes_humor WHERE id = %s AND usuario_id = %s"
        execute_query(query, (self.id, self.usuario_id))
        return True