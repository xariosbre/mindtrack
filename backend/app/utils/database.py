import pymysql
from app.config import Config
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Retorna uma conexão com o banco de dados MySQL"""
    try:
        connection = pymysql.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return connection
    except Exception as e:
        logger.error(f"Erro ao conectar com o banco de dados: {e}")
        raise

def init_db():
    """Inicializa o banco de dados e verifica a conexão"""
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result:
                logger.info("Conexão com banco de dados estabelecida com sucesso!")
        connection.close()
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise

def execute_query(query, params=None, fetch=False):
    """
    Executa uma query no banco de dados
    
    Args:
        query (str): Query SQL a ser executada
        params (tuple): Parâmetros para a query
        fetch (bool): Se deve retornar os resultados
    
    Returns:
        list|int: Resultados da query ou ID do último insert
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            
            if fetch:
                if 'SELECT' in query.upper():
                    return cursor.fetchall()
                else:
                    return cursor.fetchone()
            else:
                if 'INSERT' in query.upper():
                    return cursor.lastrowid
                else:
                    return cursor.rowcount
    except Exception as e:
        logger.error(f"Erro ao executar query: {e}")
        raise
    finally:
        connection.close()

def execute_many(query, params_list):
    """
    Executa múltiplas queries com diferentes parâmetros
    
    Args:
        query (str): Query SQL a ser executada
        params_list (list): Lista de parâmetros para cada execução
    
    Returns:
        int: Número de linhas afetadas
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount
    except Exception as e:
        logger.error(f"Erro ao executar múltiplas queries: {e}")
        raise
    finally:
        connection.close()