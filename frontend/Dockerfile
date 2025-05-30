# mindtrack/frontend/Dockerfile

# Usar uma imagem base oficial do Node.js
FROM node:18-alpine

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar package.json e package-lock.json para instalar as dependências
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que o React vai rodar
EXPOSE 3000

# Comando para rodar a aplicação React em modo de desenvolvimento
CMD ["npm", "start"]