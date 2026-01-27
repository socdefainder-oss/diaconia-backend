import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getQuizQuestions,
  submitQuiz,
  getQuizAttempts,
  getBestAttempt,
} from '../controllers/quizController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Obter perguntas do quiz de uma aula
router.get('/:courseId/:moduleId/:lessonId/questions', getQuizQuestions);

// Submeter respostas do quiz
router.post('/:courseId/:moduleId/:lessonId/submit', submitQuiz);

// Obter histórico de tentativas
router.get('/:courseId/:lessonId/attempts', getQuizAttempts);

// Obter melhor tentativa
router.get('/:courseId/:lessonId/best', getBestAttempt);

export default router;
