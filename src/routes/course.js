import express from 'express';
import { getCourses, createCourse, deleteCourse, updateCourse } from '../controllers/course.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses); // Hamma ko'ra oladi
router.post('/', protect, adminOnly, createCourse); // Faqat admin
router.put('/:id', protect, adminOnly, updateCourse); // Faqat admin
router.delete('/:id', protect, adminOnly, deleteCourse); // Faqat admin

export default router;