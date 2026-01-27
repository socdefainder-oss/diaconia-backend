import express from 'express';
import * as userController from '../controllers/userController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { idValidator } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = express.Router();

router.use(protect);
router.use(authorize(UserRole.ADMIN));

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/stats', userController.getDashboardStats);
router.get('/:id', idValidator, validate, userController.getUser);
router.put('/:id', idValidator, validate, userController.updateUser);
router.delete('/:id', idValidator, validate, userController.deleteUser);
router.put('/:id/toggle-status', idValidator, validate, userController.toggleUserStatus);

export default router;
