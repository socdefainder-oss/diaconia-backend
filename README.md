# 🙏 Diaconia AD Alpha - Backend

Sistema de Gestão Completo para Diaconia da Igreja AD Alpha

## 🚀 Funcionalidades

### 👤 Autenticação e Autorização
- Login/Registro com JWT
- Controle de acesso (Admin/Aluno)
- Refresh Token
- Recuperação de senha

### 📚 Gestão de Cursos
- CRUD de cursos
- Aulas e módulos
- Material didático
- Progresso dos alunos
- Certificados

### 📅 Sistema de Escalas
- Criação automática de escalas
- Designação de funções
- Notificações automáticas
- Histórico de escalas
- Substituições

### 👥 Gestão de Membros
- Cadastro completo
- Perfis e informações
- Histórico de participação
- Status e funções

### 💬 Comunicações
- Mensagens internas
- Grupos de comunicação
- Chat em tempo real
- Anexos

### 📢 Avisos e Notificações
- Avisos gerais
- Notificações push
- Email automático
- Prioridades

### 📊 Dashboard e Relatórios
- Estatísticas gerais
- Relatórios de presença
- Desempenho de cursos
- Métricas de engajamento

## 🛠️ Tecnologias

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose**
- **JWT** (autenticação)
- **Socket.io** (tempo real)
- **Nodemailer** (emails)
- **Cloudinary** (upload de arquivos)
- **Node-cron** (tarefas agendadas)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 🔧 Configuração

1. Configure o MongoDB (local ou Atlas)
2. Configure as variáveis de ambiente no arquivo `.env`
3. Configure o serviço de email (Gmail, SendGrid, etc)
4. Configure o Cloudinary para upload de imagens

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (DB, email, etc)
├── models/          # Modelos Mongoose
├── controllers/     # Controladores
├── routes/          # Rotas da API
├── middlewares/     # Middlewares (auth, validation, etc)
├── services/        # Lógica de negócio
├── utils/           # Utilitários
├── types/           # Tipos TypeScript
└── server.ts        # Entrada da aplicação
```

## 🔐 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Recuperar senha

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Criar curso (Admin)
- `GET /api/courses/:id` - Detalhes do curso
- `PUT /api/courses/:id` - Atualizar curso (Admin)
- `DELETE /api/courses/:id` - Deletar curso (Admin)

### Escalas
- `GET /api/schedules` - Listar escalas
- `POST /api/schedules` - Criar escala (Admin)
- `POST /api/schedules/auto-generate` - Gerar automaticamente
- `PUT /api/schedules/:id` - Atualizar escala

### Membros
- `GET /api/members` - Listar membros
- `POST /api/members` - Cadastrar membro (Admin)
- `GET /api/members/:id` - Detalhes do membro
- `PUT /api/members/:id` - Atualizar membro

### Comunicações
- `GET /api/communications` - Listar mensagens
- `POST /api/communications` - Enviar mensagem
- `GET /api/communications/:id` - Detalhes da mensagem

### Avisos
- `GET /api/announcements` - Listar avisos
- `POST /api/announcements` - Criar aviso (Admin)
- `PUT /api/announcements/:id` - Atualizar aviso
- `DELETE /api/announcements/:id` - Deletar aviso

## 🚀 Deploy

### Render (Backend)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático configurado

### MongoDB Atlas
1. Crie um cluster gratuito
2. Configure IP whitelist
3. Copie a connection string para `.env`

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido para

Diaconia AD Alpha - Sistema de Gestão Ministerial
