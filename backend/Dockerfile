# Usar uma imagem base oficial do Python
FROM python:3.9-slim-buster

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar o arquivo de requisitos e instalar as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código da aplicação
COPY . .

# Criar o diretório de uploads se não existir e garantir permissões
RUN mkdir -p uploads/profile_pics && chmod -R 777 uploads/profile_pics

# Expor a porta que o Flask vai rodar
EXPOSE 5000

# Comando para rodar a aplicação Flask
# Usar Gunicorn para produção é recomendado, mas para desenvolvimento, Flask run é ok.
# CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
CMD ["python", "app.py"]