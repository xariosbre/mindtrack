from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.utils.database import init_db
from app.services.email_service import init_email_service # Importa a função de inicialização do email

# Importar blueprints (rotas)
from app.routes.auth import auth_bp
from app.routes.user import user_bp
from app.routes.habit import habit_bp
from app.routes.mood import mood_bp
from app.routes.goal import goal_bp
from app.routes.report import report_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurações
    CORS(app, supports_credentials=True) # Habilita CORS com suporte a credenciais (cookies)
    jwt = JWTManager(app)
    
    # Inicializar banco de dados
    init_db()
    
    # Inicializar serviço de email
    init_email_service(app)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(habit_bp, url_prefix='/api/habits')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    app.register_blueprint(goal_bp, url_prefix='/api/goals')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    
    @app.route('/')
    def home():
        return {'message': 'API Sistema de Hábitos e Humor - EPIC 1 & 2', 'status': 'online'}
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'API funcionando corretamente'}

    # Rota para servir arquivos estáticos de upload (e.g., fotos de perfil)
    # APENAS PARA DESENVOLVIMENTO. Em produção, use Nginx/Apache.
    @app.route(f'/{Config.UPLOAD_FOLDER}/<path:filename>')
    def uploaded_file(filename):
        upload_dir = os.path.join(app.root_path, Config.UPLOAD_FOLDER)
        return send_from_directory(upload_dir, filename)
            
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)