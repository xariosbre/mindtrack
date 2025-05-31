class User:
    """
    Representa um usuário no sistema.
    Corresponde à tabela 'usuarios' no banco de dados.
    """
    def __init__(self, id, nome, email, senha, tipo_usuario='usuario', foto_perfil=None, ativo=True, data_criacao=None, data_atualizacao=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.senha = senha  # A senha aqui já deve ser o hash
        self.foto_perfil = foto_perfil
        self.tipo_usuario = tipo_usuario
        self.ativo = ativo
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    @staticmethod
    def from_dict(data):
        """Cria uma instância de User a partir de um dicionário (e.g., resultado de query do DB)."""
        return User(
            id=data.get('id'),
            nome=data.get('nome'),
            email=data.get('email'),
            senha=data.get('senha'),
            tipo_usuario=data.get('tipo_usuario'),
            foto_perfil=data.get('foto_perfil'),
            ativo=data.get('ativo', True),
            data_criacao=data.get('data_criacao'),
            data_atualizacao=data.get('data_atualizacao')
        )

    def to_dict(self):
        """Converte a instância de User para um dicionário (útil para jsonify)."""
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'foto_perfil': self.foto_perfil,
            'tipo_usuario': self.tipo_usuario,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

    @staticmethod
    def get_by_id(user_id):
        """Busca um usuário pelo ID no banco de dados."""
        from app.utils.database import execute_query # Importação local para evitar circular
        query = "SELECT id, nome, email, senha, tipo_usuario, foto_perfil, ativo, data_criacao, data_atualizacao FROM usuarios WHERE id = %s"
        result = execute_query(query, (user_id,), fetch=True)
        if result:
            return User.from_dict(result[0])
        return None

    @staticmethod
    def get_by_email(email):
        """Busca um usuário pelo email no banco de dados."""
        from app.utils.database import execute_query # Importação local para evitar circular
        query = "SELECT id, nome, email, senha, tipo_usuario, foto_perfil, ativo, data_criacao, data_atualizacao FROM usuarios WHERE email = %s"
        result = execute_query(query, (email,), fetch=True)
        if result:
            return User.from_dict(result[0])
        return None

    def save(self):
        """Salva (atualiza ou insere) o usuário no banco de dados."""
        from app.utils.database import execute_query
        if self.id: # Atualizar
            query = """
                UPDATE usuarios SET nome = %s, email = %s, senha = %s, 
                foto_perfil = %s, tipo_usuario = %s, ativo = %s
                WHERE id = %s
            """
            params = (self.nome, self.email, self.senha, self.foto_perfil, 
                      self.tipo_usuario, self.ativo, self.id)
            execute_query(query, params)
        else: # Inserir novo
            query = """
                INSERT INTO usuarios (nome, email, senha, tipo_usuario, foto_perfil)
                VALUES (%s, %s, %s, %s, %s)
            """
            params = (self.nome, self.email, self.senha, self.tipo_usuario, self.foto_perfil)
            self.id = execute_query(query, params)
        return self.id