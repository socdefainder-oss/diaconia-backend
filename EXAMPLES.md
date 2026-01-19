# 🧪 Exemplos de Requisições - API Diaconia

## Usando cURL (Terminal)

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Informações da API
```bash
curl http://localhost:5000/
```

### 3. Registrar Usuário
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@example.com",
    "password": "senha123"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@diaconia-alpha.com",
    "password": "Admin@123"
  }'
```

**Resposta** (copie o token):
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Obter Perfil (Requer Token)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 6. Listar Cursos (Requer Token)
```bash
curl http://localhost:5000/api/courses \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 7. Criar Curso (Requer Token Admin)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso de Liderança Cristã",
    "description": "Aprenda os princípios bíblicos de liderança",
    "category": "Liderança",
    "level": "intermediário",
    "lessons": [
      {
        "title": "Introdução à Liderança",
        "description": "Conceitos básicos",
        "order": 1,
        "duration": 30
      }
    ]
  }'
```

### 8. Criar Escala (Requer Token Admin)
```bash
curl -X POST http://localhost:5000/api/schedules \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Culto Domingo Manhã",
    "date": "2026-02-01",
    "startTime": "09:00",
    "endTime": "11:00",
    "function": "louvor",
    "assignedTo": "USER_ID_AQUI",
    "notes": "Trazer violão"
  }'
```

### 9. Gerar Escalas Automaticamente (Admin)
```bash
curl -X POST http://localhost:5000/api/schedules/auto-generate \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-02-01",
    "endDate": "2026-02-28",
    "functions": ["louvor", "portaria", "sonorizacao"],
    "daysOfWeek": [0, 3],
    "startTime": "19:00",
    "endTime": "21:00"
  }'
```

### 10. Criar Aviso (Admin)
```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Retiro Espiritual 2026",
    "content": "Participe do nosso retiro espiritual nos dias 15-17 de março!",
    "priority": "high",
    "targetAudience": ["aluno", "admin"],
    "isPinned": true
  }'
```

---

## Usando PowerShell

### 1. Login
```powershell
$body = @{
    email = "admin@diaconia-alpha.com"
    password = "Admin@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$token = $response.data.token
Write-Host "Token: $token"
```

### 2. Listar Cursos
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/courses" `
    -Method GET `
    -Headers $headers
```

### 3. Criar Curso
```powershell
$body = @{
    title = "Curso de Liderança"
    description = "Aprenda princípios de liderança cristã"
    category = "Liderança"
    level = "intermediário"
    lessons = @(
        @{
            title = "Introdução"
            description = "Conceitos básicos"
            order = 1
            duration = 30
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/courses" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body
```

---

## Usando Postman/Insomnia

### Setup Inicial

1. **Criar Environment/Workspace**
   - `baseUrl`: `http://localhost:5000`
   - `token`: (será preenchido após login)

2. **Criar Collection "Diaconia API"**

### Requests

#### 1. Health Check
```
GET {{baseUrl}}/health
```

#### 2. Login
```
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@diaconia-alpha.com",
  "password": "Admin@123"
}
```

**Test Script** (para salvar token automaticamente):
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
});
```

#### 3. Get Profile
```
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{token}}
```

#### 4. List Courses
```
GET {{baseUrl}}/api/courses?page=1&limit=10
Authorization: Bearer {{token}}
```

#### 5. Create Course
```
POST {{baseUrl}}/api/courses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Curso de Liderança",
  "description": "Aprenda princípios de liderança cristã",
  "category": "Liderança",
  "level": "intermediário",
  "lessons": [
    {
      "title": "Introdução",
      "description": "Conceitos básicos",
      "order": 1,
      "duration": 30
    }
  ]
}
```

#### 6. List Schedules
```
GET {{baseUrl}}/api/schedules?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer {{token}}
```

#### 7. Create Schedule
```
POST {{baseUrl}}/api/schedules
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Culto Domingo",
  "date": "2026-02-01",
  "startTime": "09:00",
  "endTime": "11:00",
  "function": "louvor",
  "assignedTo": "USER_ID",
  "notes": "Trazer violão"
}
```

#### 8. Auto-Generate Schedules
```
POST {{baseUrl}}/api/schedules/auto-generate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "functions": ["louvor", "portaria", "sonorizacao"],
  "daysOfWeek": [0, 3],
  "startTime": "19:00",
  "endTime": "21:00"
}
```

#### 9. List Announcements
```
GET {{baseUrl}}/api/announcements
Authorization: Bearer {{token}}
```

#### 10. Create Announcement
```
POST {{baseUrl}}/api/announcements
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Retiro Espiritual",
  "content": "Participe do nosso retiro!",
  "priority": "high",
  "targetAudience": ["aluno", "admin"],
  "isPinned": true
}
```

#### 11. List Users (Admin Only)
```
GET {{baseUrl}}/api/users
Authorization: Bearer {{token}}
```

#### 12. Get Dashboard Stats (Admin Only)
```
GET {{baseUrl}}/api/users/stats
Authorization: Bearer {{token}}
```

---

## JavaScript/TypeScript (Fetch API)

```typescript
// Login
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data;
  }
  
  throw new Error(data.message);
}

// Get Courses
async function getCourses() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/courses', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data.data;
}

// Create Course
async function createCourse(courseData: any) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/courses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  
  const data = await response.json();
  return data;
}
```

---

## Axios (JavaScript/TypeScript)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.data.token);
  return data.data;
};

// Get Courses
export const getCourses = async (page = 1, limit = 10) => {
  const { data } = await api.get('/courses', {
    params: { page, limit },
  });
  return data;
};

// Create Course
export const createCourse = async (courseData: any) => {
  const { data } = await api.post('/courses', courseData);
  return data;
};

// Get Schedules
export const getSchedules = async (startDate?: string, endDate?: string) => {
  const { data } = await api.get('/schedules', {
    params: { startDate, endDate },
  });
  return data;
};
```

---

## 🔍 Dicas

1. **Sempre salve o token** após o login
2. **Inclua o token** em todas as requisições protegidas
3. **Use variáveis de ambiente** para a baseURL
4. **Trate erros** adequadamente
5. **Valide responses** antes de usar os dados

---

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
