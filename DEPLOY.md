# Instruções de Deploy - Render

## 1. Preparação

1. Certifique-se de que o código está no GitHub
2. Crie uma conta no [Render](https://render.com)

## 2. Criar MongoDB no Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure Network Access (0.0.0.0/0 para permitir todas as conexões)
4. Obtenha a connection string
5. Substitua `<password>` pela sua senha

## 3. Deploy no Render

### Criar Web Service

1. No Render Dashboard, clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub `diaconia-backend`
3. Configure:

```
Name: diaconia-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
```

### Configurar Variáveis de Ambiente

Em "Environment", adicione:

```
NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=<sua_connection_string_do_atlas>
JWT_SECRET=<gere_uma_chave_secreta_forte>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<gere_outra_chave_secreta_forte>
JWT_REFRESH_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<seu_email>
EMAIL_PASSWORD=<sua_senha_de_app>
EMAIL_FROM=noreply@diaconia-alpha.com
CLOUDINARY_CLOUD_NAME=<seu_cloudinary>
CLOUDINARY_API_KEY=<sua_api_key>
CLOUDINARY_API_SECRET=<sua_api_secret>
FRONTEND_URL=<url_do_frontend_no_vercel>
ADMIN_EMAIL=admin@diaconia-alpha.com
ADMIN_PASSWORD=<senha_forte_para_admin>
ADMIN_NAME=Administrador
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Clique em "Create Web Service"
5. Aguarde o deploy (pode levar alguns minutos)

## 4. Criar Admin Inicial

Após o deploy, execute o seed do admin:

1. No Render Dashboard, vá em "Shell"
2. Execute:
```bash
node dist/scripts/seedAdmin.js
```

## 5. Testar API

Sua API estará disponível em: `https://diaconia-backend.onrender.com`

Teste o endpoint de health:
```
GET https://diaconia-backend.onrender.com/health
```

## 6. Configurar CORS

Certifique-se de que a variável `FRONTEND_URL` está configurada corretamente com a URL do Vercel.

## 🎉 Deploy Concluído!

Sua API está no ar! Anote a URL para configurar no frontend.

## Observações

- **Render Free Tier**: O serviço pode dormir após 15 minutos de inatividade
- **Cold Start**: A primeira requisição pode demorar ~30 segundos
- Para evitar cold starts, considere fazer um ping a cada 10 minutos ou usar um plano pago

## Monitoramento

- Logs disponíveis no Render Dashboard
- Configure alertas para erros
- Monitore uso de recursos
