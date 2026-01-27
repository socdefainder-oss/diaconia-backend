# 📝 Sistema de Questionário - Implementação Completa

## ✅ BACKEND - CONCLUÍDO

### Modelos Criados/Atualizados

#### 1. Course Model (`src/models/Course.ts`)
- ✅ Adicionado `quiz` array em cada lesson
- ✅ Validação: exatamente 5 perguntas por quiz
- ✅ Cada pergunta tem 4 opções, apenas 1 correta
- ✅ Estrutura:
```typescript
quiz: [
  {
    question: string,
    options: [
      { text: string, isCorrect: boolean }
    ],
    order: number
  }
]
```

#### 2. QuizAttempt Model (`src/models/QuizAttempt.ts`)
- ✅ Armazena todas as tentativas de quiz dos alunos
- ✅ Campos: user, course, moduleId, lessonId, answers, score, passed
- ✅ Passed = true se score >= 80% (4 de 5 corretas)

#### 3. CourseProgress Model (`src/models/CourseProgress.ts`)
- ✅ Adicionado campos de quiz em ILessonProgress:
  - `quizCompleted`: boolean
  - `quizScore`: number (0-100)
  - `quizPassed`: boolean
  - `quizAttempts`: number

### Controllers Criados/Atualizados

#### 1. QuizController (`src/controllers/quizController.ts`)
✅ **GET** `/api/quiz/:courseId/:moduleId/:lessonId/questions`
- Retorna perguntas SEM revelar respostas corretas
- Usado pelo aluno para visualizar o quiz

✅ **POST** `/api/quiz/:courseId/:moduleId/:lessonId/submit`
- Recebe respostas do aluno
- Calcula pontuação (0-100)
- Valida se passou (>= 80%)
- Salva tentativa no QuizAttempt
- Atualiza CourseProgress
- Marca aula como completa SE vídeo foi assistido E quiz passou

✅ **GET** `/api/quiz/:courseId/:lessonId/attempts`
- Histórico de todas as tentativas do aluno

✅ **GET** `/api/quiz/:courseId/:lessonId/best`
- Melhor tentativa do aluno (maior score)

#### 2. ProgressController (`src/controllers/progressController.ts`)
✅ Atualizado `checkLessonAccess`:
- Próxima aula só liberada se aula anterior:
  - Vídeo completo (watchedDuration)
  - Quiz completo E aprovado (quizPassed)

### Rotas (`src/routes/quizRoutes.ts`)
✅ Todas as rotas registradas em `/api/quiz`
✅ Todas requerem autenticação

### Types (`src/types/index.ts`)
✅ Interfaces atualizadas:
- `IQuizOption`
- `IQuizQuestion`
- `ILesson` (com quiz opcional)

---

## 🚧 FRONTEND - A IMPLEMENTAR

### 1. Interface Admin - Criar/Editar Perguntas

**Arquivo:** `components/QuizEditor.tsx` (criar)

**Funcionalidades:**
- Exibir 5 campos de perguntas (obrigatório)
- Cada pergunta tem 4 opções
- Radio button para marcar qual é a correta
- Validação: impedir salvar se não tiver exatamente 5 perguntas
- Validação: cada pergunta deve ter exatamente 1 opção correta

**Estrutura de dados:**
```typescript
interface Quiz {
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    order: number;
  }>;
}
```

**Integração:**
- Incluir componente na página de edição de aula/módulo
- Ao salvar curso, incluir quiz no payload da aula

**Exemplo de UI:**
```
Questionário da Aula (Obrigatório - 5 perguntas)

┌─ Pergunta 1 ────────────────────────────────────────┐
│ [_______________________________________________]    │
│                                                      │
│ Opções:                                              │
│ ⚪ A: [____________________]                         │
│ 🔘 B: [____________________] ✓ Correta               │
│ ⚪ C: [____________________]                         │
│ ⚪ D: [____________________]                         │
└─────────────────────────────────────────────────────┘

[+ Adicionar Pergunta] (desabilitado se já tem 5)
```

### 2. Interface Aluno - Responder Quiz

**Arquivo:** `components/QuizPlayer.tsx` (criar)

**Funcionalidades:**
- Exibir APÓS vídeo ser assistido completamente
- Mostrar 5 perguntas, uma por vez ou todas juntas
- Radio buttons para selecionar resposta
- Botão "Enviar Respostas" (só ativa se todas respondidas)
- Após envio, exibir:
  - Pontuação (X de 5 corretas)
  - Percentual (XX%)
  - Passou/Reprovou
  - Quais errou (opcional)
  - Botão "Tentar Novamente" se reprovou
  - Botão "Próxima Aula" se passou

**Fluxo:**
1. Aluno assiste vídeo até o fim
2. Quiz aparece automaticamente
3. Aluno responde todas as 5 perguntas
4. Clica em "Enviar Respostas"
5. Sistema chama `POST /api/quiz/:courseId/:moduleId/:lessonId/submit`
6. Exibe resultado
7. Se passou (>= 4 corretas): libera próxima aula
8. Se reprovou (< 4): permite tentar novamente

**Endpoints a usar:**
```typescript
// Buscar perguntas
GET /api/quiz/${courseId}/${moduleId}/${lessonId}/questions

// Enviar respostas
POST /api/quiz/${courseId}/${moduleId}/${lessonId}/submit
Body: {
  answers: [
    { questionIndex: 0, selectedOption: 1 },
    { questionIndex: 1, selectedOption: 0 },
    { questionIndex: 2, selectedOption: 3 },
    { questionIndex: 3, selectedOption: 2 },
    { questionIndex: 4, selectedOption: 1 }
  ]
}

// Response:
{
  success: true,
  score: 80,
  correctAnswers: 4,
  totalQuestions: 5,
  passed: true,
  message: "Parabéns! Você passou no questionário...",
  results: [
    { questionIndex: 0, isCorrect: true, ... },
    ...
  ]
}
```

### 3. Atualizar Página de Aula

**Arquivo:** `app/dashboard/courses/[id]/page.tsx` (atualizar)

**Mudanças necessárias:**
1. Após vídeo terminar, verificar se aula tem quiz
2. Se tem quiz:
   - Exibir `<QuizPlayer />`
   - Bloquear botão "Marcar como Concluída"
   - Só marcar como concluída após quiz aprovado
3. Se não tem quiz:
   - Comportamento atual (marcar completa após vídeo)

### 4. Atualizar Lógica de Bloqueio

**Arquivo:** `app/dashboard/courses/[id]/page.tsx` (atualizar)

**Verificação de desbloqueio:**
```typescript
const isLessonUnlocked = (lessonIndex: number) => {
  if (lessonIndex === 0) return true; // Primeira sempre desbloqueada
  
  const previousLesson = progress.completedLessons[lessonIndex - 1];
  if (!previousLesson) return false;
  
  // Verificar se tem quiz
  const hasQuiz = lessons[lessonIndex - 1].quiz && lessons[lessonIndex - 1].quiz.length > 0;
  
  if (hasQuiz) {
    // Deve ter vídeo completo E quiz aprovado
    return previousLesson.completed && 
           previousLesson.quizCompleted && 
           previousLesson.quizPassed;
  } else {
    // Só vídeo completo
    return previousLesson.completed;
  }
};
```

### 5. Types do Frontend

**Arquivo:** `types/index.ts` (atualizar)

```typescript
export interface QuizOption {
  text: string;
  isCorrect?: boolean; // Só vem no admin
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  order: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  order: number;
  quiz?: QuizQuestion[]; // ADICIONAR ESTA LINHA
  resources?: Resource[];
  isPreview?: boolean;
}

export interface LessonProgress {
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Date;
  watchedDuration: number;
  quizCompleted: boolean; // ADICIONAR
  quizScore?: number; // ADICIONAR
  quizPassed: boolean; // ADICIONAR
  quizAttempts: number; // ADICIONAR
}
```

### 6. Serviço de API

**Arquivo:** `services/quizService.ts` (criar)

```typescript
import api from './api';

export const quizService = {
  // Obter perguntas do quiz
  getQuestions: async (courseId: string, moduleId: string, lessonId: string) => {
    const response = await api.get(`/quiz/${courseId}/${moduleId}/${lessonId}/questions`);
    return response.data;
  },

  // Enviar respostas
  submitAnswers: async (
    courseId: string, 
    moduleId: string, 
    lessonId: string, 
    answers: Array<{ questionIndex: number; selectedOption: number }>
  ) => {
    const response = await api.post(`/quiz/${courseId}/${moduleId}/${lessonId}/submit`, {
      answers
    });
    return response.data;
  },

  // Obter tentativas
  getAttempts: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/quiz/${courseId}/${lessonId}/attempts`);
    return response.data;
  },

  // Melhor tentativa
  getBestAttempt: async (courseId: string, lessonId: string) => {
    const response = await api.get(`/quiz/${courseId}/${lessonId}/best`);
    return response.data;
  },
};
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO FRONTEND

### Admin (Criar Perguntas)
- [ ] Criar componente `QuizEditor.tsx`
- [ ] Adicionar validação de 5 perguntas obrigatórias
- [ ] Validação de 4 opções por pergunta
- [ ] Validação de 1 opção correta por pergunta
- [ ] Integrar no formulário de edição de aula
- [ ] Salvar quiz junto com dados da aula

### Aluno (Responder Quiz)
- [ ] Criar componente `QuizPlayer.tsx`
- [ ] Criar `services/quizService.ts`
- [ ] Buscar perguntas após vídeo terminar
- [ ] Interface para responder perguntas
- [ ] Enviar respostas e exibir resultado
- [ ] Permitir retry se reprovar
- [ ] Liberar próxima aula se aprovar

### Integração
- [ ] Atualizar `types/index.ts` com campos de quiz
- [ ] Atualizar página de aula com QuizPlayer
- [ ] Atualizar lógica de bloqueio/desbloqueio
- [ ] Testar fluxo completo: assistir → responder → passar → próxima aula
- [ ] Testar fluxo de reprovação e retry

---

## 🎯 REGRAS DE NEGÓCIO IMPLEMENTADAS

### Backend
✅ Quiz tem exatamente 5 perguntas
✅ Cada pergunta tem 4 opções
✅ Apenas 1 opção correta por pergunta
✅ Mínimo 4 corretas para passar (80%)
✅ Aula só completa se vídeo E quiz (se existir)
✅ Próxima aula só liberada após completar anterior
✅ Aluno pode tentar quantas vezes quiser
✅ Sistema registra todas as tentativas

### Frontend (a implementar)
- Quiz aparece após vídeo terminar
- Não pode pular perguntas
- Deve responder todas para enviar
- Exibe resultado imediatamente
- Permite retry ilimitado se reprovar
- Libera próxima aula automaticamente se passar

---

## 🔧 COMANDOS ÚTEIS

### Testar API manualmente:
```bash
# Obter perguntas (substitua IDs reais)
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:5000/api/quiz/COURSE_ID/MODULE_ID/LESSON_ID/questions

# Enviar respostas
curl -X POST -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionIndex":0,"selectedOption":1},...]}' \
  http://localhost:5000/api/quiz/COURSE_ID/MODULE_ID/LESSON_ID/submit
```

---

## 📝 OBSERVAÇÕES

- Backend está 100% pronto e testado
- Frontend precisa de implementação completa
- Componentes são independentes e reutilizáveis
- Sistema é retrocompatível (aulas sem quiz continuam funcionando)
- Admin não é obrigado a adicionar quiz em todas as aulas

---

**Status:** Backend ✅ | Frontend 🚧
**Commit:** `1e087c9 - feat: Sistema de questionário obrigatório - 5 perguntas por aula, mínimo 80% para avançar`
**Deploy:** Backend está sendo deployado automaticamente no Render
