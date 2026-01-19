import express from 'express';
import * as courseController from '../controllers/courseController';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { createCourseValidator, idValidator } from '../middlewares/validators';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.use(protect);

router.get('/', courseController.getCourses);
router.get('/:id', idValidator, validate, courseController.getCourse);

router.post(
  '/',
  authorize(UserRole.ADMIN),
  upload.single('thumbnail'),
  createCourseValidator,
  validate,
  courseController.createCourse
);

router.put('/:id', authorize(UserRole.ADMIN), idValidator, validate, courseController.updateCourse);
router.delete('/:id', authorize(UserRole.ADMIN), idValidator, validate, courseController.deleteCourse);

router.post('/:id/enroll', idValidator, validate, courseController.enrollCourse);
router.post('/:id/lessons/:lessonIndex/complete', courseController.completeLesson);

export default router;
