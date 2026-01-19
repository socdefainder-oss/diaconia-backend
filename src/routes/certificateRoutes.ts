import express from 'express';
import { generateCertificate, verifyCertificate } from '../controllers/certificateController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Gerar certificado (requer autenticação)
router.post('/:courseId/generate', authenticate, generateCertificate);

// Verificar certificado (público)
router.get('/verify/:certificateId', verifyCertificate);

export default router;
