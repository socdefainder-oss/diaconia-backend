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

router.use(protect);

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', authorize(UserRole.ADMIN), createTeam);
router.put('/:id', authorize(UserRole.ADMIN), updateTeam);
router.delete('/:id', authorize(UserRole.ADMIN), deleteTeam);
router.post('/:id/members', authorize(UserRole.ADMIN), addMemberToTeam);
router.delete('/:id/members/:userId', authorize(UserRole.ADMIN), removeMemberFromTeam);

export default router;
