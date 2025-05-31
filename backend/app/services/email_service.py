from flask_mail import Mail, Message
from flask import current_app
import os

mail = Mail() # Instancia o objeto Mail

def init_email_service(app):
    """Inicializa o serviço de email com a aplicação Flask."""
    mail.init_app(app)

def send_password_reset_email(user_email, reset_link, user_name="Usuário"):
    """
    Envia um email com o link de redefinição de senha.
    HU03 - Recuperação de Senha.
    """
    with current_app.app_context(): # Garante que estamos no contexto da aplicação
        msg = Message(
            subject="Redefinição de Senha - Sistema de Hábitos e Humor",
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[user_email]
        )
        msg.html = f"""
        <html>
        <head></head>
        <body>
            <p>Olá, {user_name},</p>
            <p>Você solicitou uma redefinição de senha para sua conta no Sistema de Hábitos e Humor.</p>
            <p>Clique no link abaixo para redefinir sua senha:</p>
            <p><a href="{reset_link}">Redefinir Senha</a></p>
            <p>Este link é válido por 1 hora.</p>
            <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
            <p>Atenciosamente,</p>
            <p>Equipe do Sistema de Hábitos e Humor</p>
        </body>
        </html>
        """
        try:
            mail.send(msg)
            current_app.logger.info(f"Email de redefinição enviado para {user_email}")
            return True
        except Exception as e:
            current_app.logger.error(f"Erro ao enviar email para {user_email}: {e}")
            return False