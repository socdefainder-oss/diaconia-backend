import express from 'express';
import { uploadImage, uploadVideo, deleteFile } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = express.Router();

// Todas as rotas requerem autenticação de admin
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

router.post('/image', uploadImage);
router.post('/video', uploadVideo);
router.delete('/file', deleteFile);

export default router;
