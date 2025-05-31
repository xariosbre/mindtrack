from app.utils.database import execute_query

class HabitCategory:
    """
    Representa uma categoria de hábito.
    Corresponde à tabela 'categorias_habitos'.
    """
    def __init__(self, id, nome, cor=None, icone=None):
        self.id = id
        self.nome = nome
        self.cor = cor
        self.icone = icone

    @staticmethod
    def from_dict(data):
        return HabitCategory(
            id=data.get('id'),
            nome=data.get('nome'),
            cor=data.get('cor'),
            icone=data.get('icone')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cor': self.cor,
            'icone': self.icone
        }

    @staticmethod
    def get_all_categories():
        query = "SELECT id, nome, cor, icone FROM categorias_habitos"
        results = execute_query(query, fetch=True)
        return [HabitCategory.from_dict(r) for r in results] if results else []


class Habit:
    """
    Representa um hábito definido por um usuário.
    Corresponde à tabela 'habitos'.
    """
    def __init__(self, id, usuario_id, nome, categoria_id, descricao=None, tipo_medicao='boolean',
                 unidade=None, meta_diaria=None, ativo=True, data_criacao=None, data_atualizacao=None):
        self.id = id
        self.usuario_id = usuario_id
        self.nome = nome
        self.descricao = descricao
        self.categoria_id = categoria_id
        self.tipo_medicao = tipo_medicao
        self.unidade = unidade
        self.meta_diaria = meta_diaria
        self.ativo = ativo
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    @staticmethod
    def from_dict(data):
        return Habit(
            id=data.get('id'),
            usuario_id=data.get('usuario_id'),
            nome=data.get('nome'),
            descricao=data.get('descricao'),
            categoria_id=data.get('categoria_id'),
            tipo_medicao=data.get('tipo_medicao'),
            unidade=data.get('unidade'),
            meta_diaria=data.get('meta_diaria'),
            ativo=data.get('ativo', True),
            data_criacao=data.get('data_criacao'),
            data_atualizacao=data.get('data_atualizacao')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'nome': self.nome,
            'descricao': self.descricao,
            'categoria_id': self.categoria_id,
            'tipo_medicao': self.tipo_medicao,
            'unidade': self.unidade,
            'meta_diaria': float(self.meta_diaria) if self.meta_diaria is not None else None,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

    @staticmethod
    def get_by_id(habit_id, user_id):
        query = "SELECT * FROM habitos WHERE id = %s AND usuario_id = %s AND ativo = TRUE"
        result = execute_query(query, (habit_id, user_id), fetch=True)
        if result:
            return Habit.from_dict(result[0])
        return None

    @staticmethod
    def get_all_by_user(user_id):
        query = "SELECT h.*, ch.nome AS categoria_nome FROM habitos h JOIN categorias_habitos ch ON h.categoria_id = ch.id WHERE h.usuario_id = %s AND h.ativo = TRUE ORDER BY h.nome"
        results = execute_query(query, (user_id,), fetch=True)
        # Adiciona o nome da categoria ao dicionário do hábito
        if results:
            return [{**Habit.from_dict(r).to_dict(), 'categoria_nome': r['categoria_nome']} for r in results]
        return []


    def save(self):
        if self.id: # Atualizar
            query = """
                UPDATE habitos SET nome = %s, descricao = %s, categoria_id = %s,
                tipo_medicao = %s, unidade = %s, meta_diaria = %s, ativo = %s
                WHERE id = %s AND usuario_id = %s
            """
            params = (self.nome, self.descricao, self.categoria_id, self.tipo_medicao,
                      self.unidade, self.meta_diaria, self.ativo, self.id, self.usuario_id)
            execute_query(query, params)
        else: # Inserir
            query = """
                INSERT INTO habitos (usuario_id, nome, descricao, categoria_id, tipo_medicao, unidade, meta_diaria)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            params = (self.usuario_id, self.nome, self.descricao, self.categoria_id,
                      self.tipo_medicao, self.unidade, self.meta_diaria)
            self.id = execute_query(query, params)
        return self.id

    def delete(self):
        """Marca o hábito como inativo (exclusão lógica)."""
        query = "UPDATE habitos SET ativo = FALSE WHERE id = %s AND usuario_id = %s"
        execute_query(query, (self.id, self.usuario_id))
        return True


class HabitRecord:
    """
    Representa um registro diário de um hábito.
    Corresponde à tabela 'registros_habitos'.
    """
    def __init__(self, id, habito_id, usuario_id, data_registro, valor=0.0, concluido=False, observacoes=None, data_criacao=None):
        self.id = id
        self.habito_id = habito_id
        self.usuario_id = usuario_id
        self.data_registro = data_registro # Espera um objeto date ou string 'YYYY-MM-DD'
        self.valor = valor
        self.concluido = concluido
        self.observacoes = observacoes
        self.data_criacao = data_criacao

    @staticmethod
    def from_dict(data):
        return HabitRecord(
            id=data.get('id'),
            habito_id=data.get('habito_id'),
            usuario_id=data.get('usuario_id'),
            data_registro=data.get('data_registro'),
            valor=data.get('valor'),
            concluido=data.get('concluido'),
            observacoes=data.get('observacoes'),
            data_criacao=data.get('data_criacao')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'habito_id': self.habito_id,
            'usuario_id': self.usuario_id,
            'data_registro': self.data_registro.isoformat() if isinstance(self.data_registro, (datetime.date, datetime.datetime)) else self.data_registro,
            'valor': float(self.valor),
            'concluido': bool(self.concluido),
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

    @staticmethod
    def get_by_id(record_id, user_id):
        query = "SELECT * FROM registros_habitos WHERE id = %s AND usuario_id = %s"
        result = execute_query(query, (record_id, user_id), fetch=True)
        if result:
            return HabitRecord.from_dict(result[0])
        return None

    @staticmethod
    def get_by_habit_and_date(habit_id, user_id, date_str):
        query = "SELECT * FROM registros_habitos WHERE habito_id = %s AND usuario_id = %s AND data_registro = %s"
        result = execute_query(query, (habit_id, user_id, date_str), fetch=True)
        if result:
            return HabitRecord.from_dict(result[0])
        return None

    @staticmethod
    def get_all_by_user_and_date_range(user_id, start_date, end_date):
        query = """
            SELECT rh.*, h.nome as habito_nome, h.tipo_medicao, h.unidade, h.meta_diaria
            FROM registros_habitos rh
            JOIN habitos h ON rh.habito_id = h.id
            WHERE rh.usuario_id = %s AND rh.data_registro BETWEEN %s AND %s
            ORDER BY rh.data_registro DESC, h.nome ASC
        """
        results = execute_query(query, (user_id, start_date, end_date), fetch=True)
        if results:
            # Adiciona informações do hábito ao registro
            return [{**HabitRecord.from_dict(r).to_dict(),
                     'habito_nome': r['habito_nome'],
                     'tipo_medicao': r['tipo_medicao'],
                     'unidade': r['unidade'],
                     'meta_diaria': float(r['meta_diaria']) if r['meta_diaria'] is not None else None
                     } for r in results]
        return []


    def save(self):
        from datetime import date # Importação local
        if isinstance(self.data_registro, str):
            self.data_registro = date.fromisoformat(self.data_registro)

        if self.id: # Atualizar
            query = """
                UPDATE registros_habitos SET valor = %s, concluido = %s, observacoes = %s
                WHERE id = %s AND usuario_id = %s
            """
            params = (self.valor, self.concluido, self.observacoes, self.id, self.usuario_id)
            execute_query(query, params)
        else: # Inserir
            query = """
                INSERT INTO registros_habitos (habito_id, usuario_id, data_registro, valor, concluido, observacoes)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = (self.habito_id, self.usuario_id, self.data_registro, self.valor, self.concluido, self.observacoes)
            self.id = execute_query(query, params)
        return self.id

    def delete(self):
        """Exclui um registro de hábito."""
        query = "DELETE FROM registros_habitos WHERE id = %s AND usuario_id = %s"
        execute_query(query, (self.id, self.usuario_id))
        return True