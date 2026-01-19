import express from 'express';
import * as announcementController from '../controllers/announcementController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { createAnnouncementValidator, idValidator } from '../middlewares/validators';
import { validate } from '../middlewares/validate';

const router = express.Router();

router.use(protect);

router.get('/', announcementController.getAnnouncements);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  createAnnouncementValidator,
  validate,
  announcementController.createAnnouncement
);

router.put('/:id', authorize(UserRole.ADMIN), idValidator, validate, announcementController.updateAnnouncement);
router.delete('/:id', authorize(UserRole.ADMIN), idValidator, validate, announcementController.deleteAnnouncement);

router.put('/:id/view', idValidator, validate, announcementController.markAnnouncementAsViewed);

export default router;
