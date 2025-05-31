from app.utils.database import execute_query
from datetime import date, datetime

class Goal:
    """
    Representa uma meta personalizada definida por um usuário.
    Corresponde à tabela 'metas'.
    """
    def __init__(self, id, usuario_id, titulo, tipo_meta, valor_meta, descricao=None,
                 habito_id=None, periodo='diario', data_inicio=None, data_fim=None,
                 ativa=True, notificacoes=True, data_criacao=None):
        self.id = id
        self.usuario_id = usuario_id
        self.titulo = titulo
        self.descricao = descricao
        self.habito_id = habito_id
        self.tipo_meta = tipo_meta
        self.valor_meta = valor_meta
        self.periodo = periodo
        self.data_inicio = data_inicio # Espera um objeto date ou string 'YYYY-MM-DD'
        self.data_fim = data_fim     # Espera um objeto date ou string 'YYYY-MM-DD'
        self.ativa = ativa
        self.notificacoes = notificacoes
        self.data_criacao = data_criacao

    @staticmethod
    def from_dict(data):
        return Goal(
            id=data.get('id'),
            usuario_id=data.get('usuario_id'),
            titulo=data.get('titulo'),
            descricao=data.get('descricao'),
            habito_id=data.get('habito_id'),
            tipo_meta=data.get('tipo_meta'),
            valor_meta=data.get('valor_meta'),
            periodo=data.get('periodo'),
            data_inicio=data.get('data_inicio'),
            data_fim=data.get('data_fim'),
            ativa=data.get('ativa', True),
            notificacoes=data.get('notificacoes', True),
            data_criacao=data.get('data_criacao')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'habito_id': self.habito_id,
            'tipo_meta': self.tipo_meta,
            'valor_meta': float(self.valor_meta),
            'periodo': self.periodo,
            'data_inicio': self.data_inicio.isoformat() if isinstance(self.data_inicio, (date, datetime)) else self.data_inicio,
            'data_fim': self.data_fim.isoformat() if isinstance(self.data_fim, (date, datetime)) else self.data_fim,
            'ativa': bool(self.ativa),
            'notificacoes': bool(self.notificacoes),
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

    @staticmethod
    def get_by_id(goal_id, user_id):
        query = "SELECT * FROM metas WHERE id = %s AND usuario_id = %s"
        result = execute_query(query, (goal_id, user_id), fetch=True)
        if result:
            return Goal.from_dict(result[0])
        return None

    @staticmethod
    def get_all_by_user(user_id, include_inactive=False):
        query = "SELECT * FROM metas WHERE usuario_id = %s"
        params = [user_id]
        if not include_inactive:
            query += " AND ativa = TRUE"
        query += " ORDER BY data_inicio DESC"
        results = execute_query(query, tuple(params), fetch=True)
        return [Goal.from_dict(r).to_dict() for r in results] if results else []

    def save(self):
        if isinstance(self.data_inicio, str):
            self.data_inicio = date.fromisoformat(self.data_inicio)
        if self.data_fim and isinstance(self.data_fim, str):
            self.data_fim = date.fromisoformat(self.data_fim)

        if self.id: # Atualizar
            query = """
                UPDATE metas SET titulo = %s, descricao = %s, habito_id = %s,
                tipo_meta = %s, valor_meta = %s, periodo = %s, data_inicio = %s,
                data_fim = %s, ativa = %s, notificacoes = %s
                WHERE id = %s AND usuario_id = %s
            """
            params = (self.titulo, self.descricao, self.habito_id, self.tipo_meta,
                      self.valor_meta, self.periodo, self.data_inicio, self.data_fim,
                      self.ativa, self.notificacoes, self.id, self.usuario_id)
            execute_query(query, params)
        else: # Inserir
            query = """
                INSERT INTO metas (usuario_id, titulo, descricao, habito_id,
                tipo_meta, valor_meta, periodo, data_inicio, data_fim, ativa, notificacoes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = (self.usuario_id, self.titulo, self.descricao, self.habito_id,
                      self.tipo_meta, self.valor_meta, self.periodo, self.data_inicio,
                      self.data_fim, self.ativa, self.notificacoes)
            self.id = execute_query(query, params)
        return self.id

    def delete(self):
        """Marca a meta como inativa (exclusão lógica)."""
        query = "UPDATE metas SET ativa = FALSE WHERE id = %s AND usuario_id = %s"
        execute_query(query, (self.id, self.usuario_id))
        return True