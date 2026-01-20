import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
} from '../controllers/teamController';

const router = Router();

// Rotas públicas (não precisam de autenticação)
router.get('/', getTeams);
router.get('/:id', getTeam);

// Rotas protegidas (precisam de autenticação e autorização admin)
router.post('/', protect, authorize(UserRole.ADMIN), createTeam);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateTeam);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteTeam);
router.post('/:id/members', protect, authorize(UserRole.ADMIN), addMemberToTeam);
router.delete('/:id/members/:userId', protect, authorize(UserRole.ADMIN), removeMemberFromTeam);

export default router;
