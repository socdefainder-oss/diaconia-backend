# 🚀 Deploy do Backend no Render

Este guia fornece instruções passo a passo para fazer deploy do backend Diaconia AD Alpha no Render.

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com) (gratuita)
2. Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita)
3. Conta no [Cloudinary](https://cloudinary.com) (gratuita)
4. Repositório Git do backend (diaconia-backend)

---

## 🗄️ Passo 1: Configurar MongoDB Atlas

### 1.1 Criar Cluster
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Clique em **"Build a Database"**
3. Escolha **"Shared"** (gratuito)
4. Selecione região mais próxima (ex: São Paulo - AWS)
5. Clique em **"Create Cluster"**

### 1.2 Configurar Acesso
1. No painel do cluster, clique em **"Database Access"**
2. Clique em **"Add New Database User"**
3. Escolha **"Password"** e defina:
   - Username: `diaconia_admin`
   - Password: gere uma senha forte (anote!)
4. Database User Privileges: **"Read and write to any database"**
5. Clique em **"Add User"**

### 1.3 Configurar Network Access
1. Clique em **"Network Access"**
2. Clique em **"Add IP Address"**
3. Clique em **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Clique em **"Confirm"**

### 1.4 Obter String de Conexão
1. Volte para **"Database"**
2. Clique em **"Connect"** no seu cluster
3. Escolha **"Connect your application"**
4. Copie a string de conexão (exemplo):
   ```
   mongodb+srv://diaconia_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Substitua `<password>` pela senha criada
6. Adicione o nome do banco após `.net/`: 
   ```
   mongodb+srv://diaconia_admin:suasenha@cluster0.xxxxx.mongodb.net/diaconia?retryWrites=true&w=majority
   ```

---

## ☁️ Passo 2: Configurar Cloudinary

### 2.1 Criar Conta e Obter Credenciais
1. Acesse [Cloudinary](https://cloudinary.com)
2. Crie uma conta gratuita
3. No Dashboard, você verá:
   - **Cloud Name**: `dxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxx-xxxx` (clique para revelar)
4. Anote essas 3 informações

---

## 📧 Passo 3: Configurar Email (Gmail)

### 3.1 Gerar Senha de App do Gmail
1. Acesse [Conta Google](https://myaccount.google.com)
2. Vá em **"Segurança"**
3. Ative **"Verificação em duas etapas"** (se ainda não estiver)
4. Procure por **"Senhas de app"**
5. Selecione:
   - App: **Correio**
   - Dispositivo: **Outro (nome personalizado)** → Digite "Diaconia Backend"
6. Clique em **"Gerar"**
7. Copie a senha de 16 dígitos (sem espaços)

---

## 🌐 Passo 4: Deploy no Render

### 4.1 Criar Web Service
1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub (autorize o Render)
4. Selecione o repositório `diaconia-backend`

### 4.2 Configurar Service
Preencha as informações:

**Basic Information:**
- **Name**: `diaconia-backend` (ou outro nome)
- **Region**: Oregon (US West) ou Frankfurt (Europe) [recomendado para performance]
- **Branch**: `main` (ou sua branch principal)
- **Root Directory**: deixe vazio (ou especifique se o código estiver em subpasta)

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install
  ```
- **Start Command**: 
  ```
  npm start
  ```

**Instance Type:**
- Selecione **"Free"** (ou escolha pago se preferir)

### 4.3 Adicionar Variáveis de Ambiente
Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione as seguintes variáveis (uma por uma):

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `sua-string-mongodb-atlas-completa` |
| `JWT_SECRET` | `gere-uma-string-aleatoria-segura-aqui-64caracteres` |
| `CLOUDINARY_CLOUD_NAME` | `seu-cloud-name` |
| `CLOUDINARY_API_KEY` | `sua-api-key` |
| `CLOUDINARY_API_SECRET` | `seu-api-secret` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `seu-email@gmail.com` |
| `EMAIL_PASS` | `senha-de-app-de-16-digitos` |
| `EMAIL_FROM` | `"Diaconia AD Alpha" <seu-email@gmail.com>` |
| `FRONTEND_URL` | `https://diaconia-frontend.vercel.app` (atualize depois) |

**Dica para JWT_SECRET**: Gere uma string segura executando no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 Deploy
1. Clique em **"Create Web Service"**
2. O Render começará automaticamente:
   - Clone do repositório
   - Instalação de dependências (`npm install`)
   - Build do TypeScript
   - Start do servidor
3. Aguarde 3-5 minutos (primeira vez demora mais)

### 4.5 Verificar Deploy
1. Quando aparecer **"Live"** em verde, seu backend está no ar! 🎉
2. Copie a URL fornecida (exemplo: `https://diaconia-backend.onrender.com`)
3. Teste acessando no navegador:
   ```
   https://seu-backend.onrender.com/health
   ```
   Deve retornar: `{"status":"OK","message":"Server is running"}`

---

## 🔧 Passo 5: Configurações Adicionais

### 5.1 Custom Domain (Opcional)
1. No painel do service, vá em **"Settings"**
2. Role até **"Custom Domain"**
3. Clique em **"Add Custom Domain"**
4. Siga as instruções para adicionar registros DNS

### 5.2 CORS
O backend já está configurado para aceitar requisições do frontend. Certifique-se de que `FRONTEND_URL` aponta para o domínio Vercel correto.

### 5.3 Logs
- Acesse a aba **"Logs"** para ver logs em tempo real
- Útil para debugging de problemas

### 5.4 Auto-Deploy
O Render automaticamente faz deploy quando você fizer push no GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

---

## ⚠️ Limitações do Plano Free

- **Sleep após 15 minutos de inatividade**: a primeira requisição após inatividade pode demorar 30-50 segundos
- **750 horas/mês gratuitas**: suficiente para 1 serviço rodando 24/7
- **Solução**: upgrade para plano pago ($7/mês) ou manter ativo com ping

### Manter Backend Acordado (Opcional)
Crie um cron job gratuito em [cron-job.org](https://cron-job.org):
1. Crie conta gratuita
2. Adicione novo job:
   - URL: `https://seu-backend.onrender.com/health`
   - Interval: Every 10 minutes
3. Ative o job

---

## 📝 Checklist Final

- [ ] MongoDB Atlas configurado com string de conexão
- [ ] Cloudinary configurado com credenciais
- [ ] Gmail com senha de app gerada
- [ ] Todas as variáveis de ambiente adicionadas no Render
- [ ] Deploy bem-sucedido (status "Live")
- [ ] Endpoint `/health` respondendo
- [ ] URL do backend anotada para configurar frontend

---

## 🐛 Troubleshooting

### Erro: "Application failed to respond"
- Verifique se `PORT` está definido como `5000`
- Verifique `Start Command`: deve ser `npm start`

### Erro: "MongooseError: Connection failed"
- Verifique `MONGODB_URI`: deve incluir senha e nome do banco
- Confirme que IP 0.0.0.0/0 está liberado no MongoDB Atlas

### Erro: "Build failed"
- Verifique `Build Command`: deve ser `npm install`
- Veja logs para identificar dependência faltando

### Backend lento na primeira requisição
- Normal no plano Free (sleep após inatividade)
- Considere cron job ou upgrade

---

## 📞 Suporte

- [Documentação Render](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## ✅ Próximos Passos

Após concluir o deploy do backend:
1. Anote a URL do backend (ex: `https://diaconia-backend.onrender.com`)
2. Prossiga para o deploy do frontend no Vercel (veja `VERCEL.md`)
3. Configure `NEXT_PUBLIC_API_URL` no Vercel com a URL do backend

🎉 **Backend pronto para produção!**
