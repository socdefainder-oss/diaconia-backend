import express from 'express';
import * as scheduleController from '../controllers/scheduleController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { createScheduleValidator, idValidator } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = express.Router();

router.use(protect);

router.get('/', scheduleController.getSchedules);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  createScheduleValidator,
  validate,
  scheduleController.createSchedule
);

router.post('/auto-generate', authorize(UserRole.ADMIN), scheduleController.autoGenerateSchedules);

router.put('/:id', authorize(UserRole.ADMIN), idValidator, validate, scheduleController.updateSchedule);
router.delete('/:id', authorize(UserRole.ADMIN), idValidator, validate, scheduleController.deleteSchedule);

router.put('/:id/confirm', idValidator, validate, scheduleController.confirmSchedule);

export default router;
