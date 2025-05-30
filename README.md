MindTrack: Sistema de Hábitos e Humor
Bem-vindo ao MindTrack, um sistema completo para ajudar usuários a monitorar e melhorar seus hábitos e humor. Este projeto é dividido em um frontend React e um backend Flask (Python), com um banco de dados MySQL.

Visão Geral do Projeto
O MindTrack visa fornecer uma plataforma intuitiva onde os usuários podem:

Registrar e gerenciar seus hábitos diários.

Avaliar seu humor em uma escala diária.

Visualizar o progresso através de dashboards e relatórios gráficos.

Definir e acompanhar metas personalizadas.

Administradores podem gerenciar usuários e suas permissões.

Estrutura do Projeto
mindtrack/
│
├── frontend/                          # 📱 Aplicação React (Interface do Usuário)
│   ├── public/
│   ├── src/
│   │   ├── components/               # Componentes React reutilizáveis (Header, Footer, LoadingSpinner, PrivateRoute)
│   │   ├── pages/                    # Páginas principais da aplicação (Login, Register, Profile, Dashboard, etc.)
│   │   ├── services/                 # Módulo Axios para chamadas à API do backend
│   │   ├── context/                  # Contexto global para autenticação (AuthContext)
│   │   ├── utils/                    # Funções utilitárias (validações, etc.)
│   │   ├── styles/                   # Estilos CSS globais (além do Tailwind)
│   │   ├── App.js                    # Componente principal e roteamento
│   │   └── index.js                  # Ponto de entrada do React
│   ├── package.json                  # Dependências e scripts do frontend
│   └── package-lock.json             # Bloqueio de versões de dependências do npm
│
├── backend/                           # 🐍 API Flask (Lógica de Negócio e Persistência de Dados)
│   ├── app/
│   │   ├── models/                   # Modelos de dados (User, Habit, Mood, Goal)
│   │   ├── routes/                   # Endpoints da API (auth, user, habit, mood, goal, report)
│   │   ├── services/                 # Lógica de negócio e serviços (email_service, report_service)
│   │   ├── utils/                    # Utilitários (database, decorators, uploads)
│   │   └── config.py                 # Configurações da aplicação (JWT, DB, Email, Uploads)
│   ├── requirements.txt              # Dependências Python do backend
│   └── app.py                        # Ponto de entrada do Flask
│
├── database/                          # 🗄️ Scripts SQL do Banco de Dados
│   ├── schema.sql                    # Estrutura completa do banco de dados
│   ├── initial_data.sql              # Dados iniciais para o banco de dados
│   └── migrations/                   # Scripts de migração incremental do schema
│       ├── 001_create_users.sql
│       ├── 002_create_habits.sql
│       ├── 003_create_moods.sql
│       └── 004_create_goals.sql
│
├── docs/                              # 📄 Documentação do Projeto
│   └── instalacao.md                 # Guia de instalação detalhado
│   └── README.md                     # Este arquivo
│
├── .gitignore                         # Arquivo para ignorar arquivos/pastas no Git
└── docker-compose.yml                 # Configuração para orquestração com Docker

Funcionalidades Implementadas (Histórias de Usuário)
Este projeto implementa as seguintes Histórias de Usuário (HUs) conforme especificado:

EPIC 1 - Sistema de Usuários
✅ HU01: Cadastro de Usuários - Permite que novos usuários se registrem na plataforma.

✅ HU02: Sistema de Autenticação - Permite que usuários cadastrados façam login com e-mail e senha.

✅ HU03: Recuperação de Senha - Funcionalidade para redefinir a senha via e-mail.

✅ HU04: Gerenciamento de Perfis - Usuários podem editar suas informações de perfil, incluindo foto.

✅ HU05: Perfis de Acesso Diferenciados - Administradores podem gerenciar os níveis de acesso e status dos usuários.

EPIC 2 - Sistema de Hábitos e Bem-Estar
✅ HU06: Registro de Hábitos - Usuários podem criar e registrar seus hábitos diários.

✅ HU07: Avaliação de Humor - Usuários podem registrar seu humor diário em uma escala.

✅ HU08: Dashboard de Progresso - Visualização resumida semanal de hábitos e humor com gráficos.

✅ HU09: Metas Personalizadas - Usuários podem definir e acompanhar metas relacionadas a hábitos, humor ou customizadas.

✅ HU10: Relatórios de Correlação - Geração de relatórios gráficos para analisar a correlação entre hábitos e humor.

✅ HU11: Gerenciamento Hábitos (Editar) - Usuários podem editar hábitos registrados.

✅ HU12: Gerenciamento Hábitos (Excluir) - Usuários podem desativar (exclusão lógica) hábitos.

✅ HU13: Gerenciamento Humor (Atualizar) - Usuários podem atualizar avaliações de humor feitas anteriormente.

✅ HU14: Gerenciamento Humor (Remover) - Usuários podem remover avaliações de humor registradas.

Tecnologias Utilizadas
Frontend: React (JavaScript), Tailwind CSS

Backend: Flask (Python), Flask-JWT-Extended, Flask-Mail, PyMySQL, bcrypt

Banco de Dados: MySQL

Ferramentas: Node.js, npm, pip, Git, Docker (opcional)

Como Instalar e Executar o Projeto
Pré-requisitos
Certifique-se de ter os seguintes programas instalados em sua máquina:

Node.js (v16 ou superior): nodejs.org

Python (v3.8 ou superior): python.org

MySQL Server (v8.0 ou superior): Pode ser instalado via XAMPP, Docker ou diretamente.

VS Code (ou outro editor de código): code.visualstudio.com

Git: git-scm.com

Passos para Configuração
Clonar o Repositório:

git clone <URL_DO_SEU_REPOSITORIO>
cd mindtrack

Configurar o Banco de Dados MySQL:

Crie um banco de dados MySQL chamado habitos_db (ou o nome configurado em backend/app/config.py).

Execute os scripts SQL na seguinte ordem:

# Acesse seu cliente MySQL (ex: MySQL Workbench, linha de comando)
# Conecte-se ao seu servidor MySQL

-- Crie o banco de dados se ainda não existir
CREATE DATABASE IF NOT EXISTS habitos_db;
USE habitos_db;

-- Execute o script de schema completo
SOURCE database/schema.sql;

-- Execute o script de dados iniciais
SOURCE database/initial_data.sql;

Importante: No initial_data.sql, certifique-se de substituir o hash da senha do usuário admin por um hash gerado por você (ex: usando bcrypt.hashpw(b'sua_senha_aqui', bcrypt.gensalt()) em um console Python).

Configurar o Backend (Python/Flask):

Navegue até o diretório do backend:

cd backend

Crie um ambiente virtual (recomendado):

python -m venv venv
# No Windows:
# .\venv\Scripts\activate
# No macOS/Linux:
# source venv/bin/activate

Instale as dependências Python:

pip install -r requirements.txt

Crie um arquivo .env na raiz do diretório backend com as seguintes variáveis de ambiente (substitua pelos seus dados reais):

SECRET_KEY='sua_chave_secreta_flask'
JWT_SECRET_KEY='sua_chave_secreta_jwt'

DB_HOST='localhost'
DB_PORT=3306
DB_USER='root'
DB_PASSWORD='sua_senha_mysql' # Se houver
DB_NAME='habitos_db'

MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME='seu_email@gmail.com' # Email que enviará as redefinições
MAIL_PASSWORD='sua_senha_de_app_do_gmail' # Senha de app para Gmail (não sua senha normal)
MAIL_DEFAULT_SENDER='seu_email@gmail.com'

FRONTEND_URL='http://localhost:3000'

Nota sobre MAIL_PASSWORD (Gmail): Se você estiver usando Gmail, precisará gerar uma "senha de app" (App Password) nas configurações de segurança da sua conta Google, pois a senha normal não funcionará para aplicativos de terceiros.

Inicie o servidor Flask:

python app.py

O backend estará rodando em http://127.0.0.1:5000.

Configurar o Frontend (React):

Abra um novo terminal e navegue até o diretório do frontend:

cd ../frontend

Instale as dependências Node.js:

npm install

Inicie o servidor de desenvolvimento React:

npm start

O frontend estará rodando em http://localhost:3000 (ou outra porta disponível).

Uso da Aplicação
Após seguir os passos de instalação, você poderá acessar o frontend em seu navegador (http://localhost:3000).

Cadastro (HU01): Crie uma nova conta.

Login (HU02): Acesse com suas credenciais.

Recuperação de Senha (HU03): Teste o fluxo de redefinição.

Dashboard (HU08): Visualize o resumo de hábitos e humor.

Hábitos (HU06, HU11, HU12): Crie, edite e desative hábitos.

Humor (HU07, HU13, HU14): Registre e gerencie seu humor.

Metas (HU09): Defina e acompanhe suas metas.

Relatórios (HU10): Gere relatórios de correlação.

Perfil (HU04): Atualize seus dados e foto.

Painel Admin (HU05): Se logado como admin@example.com (ou seu admin configurado), gerencie outros usuários.

Contato
Para dúvidas ou sugestões, entre em contato.
