import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { registerValidator, loginValidator, updateUserValidator } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = express.Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/forgot-password', authController.forgotPassword);

router.use(protect);

router.get('/me', authController.getMe);
router.put('/profile', updateUserValidator, validate, authController.updateProfile);
router.put('/change-password', authController.changePassword);

export default router;
