import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename
from app.config import Config

def allowed_file(filename):
    """Verifica se a extensão do arquivo é permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_profile_picture(file, user_id):
    """
    Salva uma foto de perfil no sistema de arquivos.
    Retorna o nome do arquivo salvo no servidor.
    """
    if file.filename == '':
        raise ValueError("Nenhum arquivo selecionado.")
    
    if file and allowed_file(file.filename):
        # Garante que o diretório de upload existe
        upload_path = os.path.join(current_app.root_path, Config.UPLOAD_FOLDER)
        os.makedirs(upload_path, exist_ok=True)

        # Gera um nome de arquivo único para evitar colisões
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{user_id}_{filename}"
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        return unique_filename
    else:
        raise ValueError("Tipo de arquivo não permitido.")

def get_profile_picture_url(filename):
    """
    Retorna a URL completa para uma foto de perfil.
    Assumindo que o Flask servirá arquivos estáticos do UPLOAD_FOLDER.
    """
    if filename:
        # Você precisará configurar o Flask para servir arquivos estáticos
        # de Config.UPLOAD_FOLDER. Isso geralmente é feito no app.py ou
        # por um servidor web como Nginx em produção.
        # Por enquanto, apenas um placeholder ou caminho relativo.
        return f"/uploads/profile_pics/{filename}"
    return None