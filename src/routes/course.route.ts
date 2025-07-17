// src/routes/course.route.ts
import express from 'express';
import { CourseController } from '~/controllers/course.controller';

const router = express.Router();

// GET /courses - get all courses
router.get('/', CourseController.getAll);

// GET /courses/:id - get a specific course
router.get('/:id', CourseController.getById);

// GET /courses/:courseType/topics - get topics for a specific courseType
router.get('/:courseType/topics', CourseController.getTopicsByCourseType);

// POST /courses - create a new course
router.post('/', CourseController.create);

// DELETE /courses/:id - soft delete a course
router.delete('/:id', CourseController.moveToTrash);

export default router;
