# 📋 API Documentation - Diaconia AD Alpha

## Base URL
- **Desenvolvimento**: `http://localhost:5000/api`
- **Produção**: `https://diaconia-backend.onrender.com/api`

---

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

### Endpoints Públicos

#### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "aluno" // opcional, default: aluno
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "aluno",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/auth/login`
Login de usuário

**Body:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

#### POST `/auth/forgot-password`
Recuperação de senha

**Body:**
```json
{
  "email": "joao@example.com"
}
```

### Endpoints Privados

#### GET `/auth/me`
Obter dados do usuário logado

#### PUT `/auth/profile`
Atualizar perfil

**Body:**
```json
{
  "name": "João Silva Santos",
  "phone": "(11) 98765-4321",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }
}
```

#### PUT `/auth/change-password`
Alterar senha

**Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

---

## 👥 Usuários (Admin Only)

#### GET `/users`
Listar todos os usuários

**Query Params:**
- `role`: Filter by role (admin/aluno)
- `search`: Search by name or email
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

#### GET `/users/stats`
Obter estatísticas de usuários

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalAdmins": 5,
    "totalStudents": 145,
    "activeUsers": 148,
    "inactiveUsers": 2
  }
}
```

#### GET `/users/:id`
Obter detalhes de um usuário

#### PUT `/users/:id`
Atualizar usuário

#### DELETE `/users/:id`
Deletar usuário

#### PUT `/users/:id/toggle-status`
Ativar/Desativar usuário

---

## 📚 Cursos

#### GET `/courses`
Listar todos os cursos

**Query Params:**
- `status`: Filter by status (draft/published/archived)
- `category`: Filter by category
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Curso de Liderança",
      "description": "Aprenda princípios de liderança cristã",
      "thumbnail": "https://...",
      "instructor": {
        "_id": "...",
        "name": "Pastor João",
        "email": "pastor@church.com"
      },
      "category": "Liderança",
      "status": "published",
      "lessons": [...],
      "enrolledStudents": [...],
      "duration": 180,
      "level": "intermediário"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST `/courses` (Admin Only)
Criar novo curso

**Body (multipart/form-data):**
- `title`: String (required)
- `description`: String (required)
- `category`: String (required)
- `level`: String (iniciante/intermediário/avançado)
- `thumbnail`: File (image)
- `lessons`: JSON Array

#### GET `/courses/:id`
Obter detalhes de um curso

#### PUT `/courses/:id` (Admin Only)
Atualizar curso

#### DELETE `/courses/:id` (Admin Only)
Deletar curso

#### POST `/courses/:id/enroll`
Inscrever-se em um curso

#### POST `/courses/:id/lessons/:lessonIndex/complete`
Marcar aula como completa

---

## 📅 Escalas

#### GET `/schedules`
Listar escalas

**Query Params:**
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)
- `function`: Filter by function
- `status`: Filter by status (pending/confirmed/completed/cancelled)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Culto Domingo Manhã",
      "description": "Culto de celebração",
      "date": "2026-01-26T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "11:00",
      "function": "louvor",
      "assignedTo": {
        "_id": "...",
        "name": "Maria Silva",
        "email": "maria@example.com"
      },
      "status": "confirmed",
      "notes": "Trazer violão"
    }
  ],
  "pagination": {...}
}
```

#### POST `/schedules` (Admin Only)
Criar nova escala

**Body:**
```json
{
  "title": "Culto Domingo Manhã",
  "description": "Culto de celebração",
  "date": "2026-01-26",
  "startTime": "09:00",
  "endTime": "11:00",
  "function": "louvor",
  "assignedTo": "user_id",
  "notes": "Trazer violão",
  "isRecurring": false
}
```

**Funções disponíveis:**
- `pregador`
- `louvor`
- `portaria`
- `sonorizacao`
- `multimedia`
- `infantil`
- `intercessao`
- `recepcao`
- `limpeza`
- `outros`

#### POST `/schedules/auto-generate` (Admin Only)
Gerar escalas automaticamente

**Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "functions": ["louvor", "portaria", "sonorizacao"],
  "daysOfWeek": [0, 3], // 0 = Domingo, 3 = Quarta
  "startTime": "19:00",
  "endTime": "21:00"
}
```

#### PUT `/schedules/:id` (Admin Only)
Atualizar escala

#### DELETE `/schedules/:id` (Admin Only)
Deletar escala

#### PUT `/schedules/:id/confirm`
Confirmar presença na escala (usuário designado)

---

## 📢 Avisos

#### GET `/announcements`
Listar avisos ativos

**Query Params:**
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Retiro Espiritual 2026",
      "content": "Participe do nosso retiro espiritual...",
      "author": {
        "_id": "...",
        "name": "Admin",
        "email": "admin@church.com"
      },
      "priority": "high",
      "image": "https://...",
      "targetAudience": ["aluno", "admin"],
      "isActive": true,
      "isPinned": true,
      "viewedBy": [...],
      "createdAt": "2026-01-19T..."
    }
  ],
  "pagination": {...}
}
```

#### POST `/announcements` (Admin Only)
Criar novo aviso

**Body:**
```json
{
  "title": "Título do Aviso",
  "content": "Conteúdo completo do aviso...",
  "priority": "normal",
  "targetAudience": ["aluno"],
  "isPinned": false,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

**Prioridades:**
- `low`
- `normal`
- `high`
- `urgent`

#### PUT `/announcements/:id` (Admin Only)
Atualizar aviso

#### DELETE `/announcements/:id` (Admin Only)
Deletar aviso

#### PUT `/announcements/:id/view`
Marcar aviso como visualizado

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Error Response Format

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

## 🔒 Roles & Permissions

### Admin
- Acesso completo a todas as funcionalidades
- Gerenciar usuários
- Criar/editar/deletar cursos
- Criar/editar/deletar escalas
- Criar/editar/deletar avisos

### Aluno
- Visualizar cursos publicados
- Inscrever-se em cursos
- Visualizar suas escalas
- Confirmar presença em escalas
- Visualizar avisos
- Atualizar próprio perfil

---

## 🚀 Rate Limiting

- **Window**: 15 minutos
- **Max Requests**: 100 por IP

Quando o limite é excedido:
```json
{
  "success": false,
  "message": "Muitas requisições deste IP, tente novamente mais tarde."
}
```

---

## 📧 Email Notifications

O sistema envia emails automaticamente para:
- Boas-vindas ao registrar
- Recuperação de senha
- Nova escala designada
- Avisos urgentes (futuro)

---

## 🧪 Testando a API

### Usando cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@diaconia-alpha.com","password":"Admin@123"}'

# Listar cursos (com token)
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Usando Postman/Insomnia

1. Importe a collection (criar arquivo separado)
2. Configure variável de ambiente `baseUrl`
3. Configure variável de ambiente `token`
4. Execute as requisições

---

## 💡 Dicas

1. **Sempre inclua o token** nas requisições protegidas
2. **Use paginação** para listas grandes
3. **Valide dados** no frontend antes de enviar
4. **Trate erros** adequadamente
5. **Implemente retry logic** para requisições falhadas
