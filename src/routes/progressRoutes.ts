import express from 'express';
import {
  getCourseProgress,
  completeLesson,
  updateWatchTime,
  checkLessonAccess,
} from '../controllers/progressController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/:courseId', getCourseProgress);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/complete', completeLesson);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/watch-time', updateWatchTime);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId/access', checkLessonAccess);

export default router;
