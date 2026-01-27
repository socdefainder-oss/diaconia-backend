import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { syncTeamMembers } from '../controllers/syncController';

const router = Router();

// Rota protegida - apenas admin
router.post('/team-members', protect, authorize(UserRole.ADMIN), syncTeamMembers);

export default router;
