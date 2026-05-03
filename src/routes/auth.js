import express from 'express';
import { register, login, verifyEmail, refreshToken, forgotPassword, resetPassword } from '../controllers/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/admin/dashboard', protect, adminOnly, (req, res) => {
    res.json({ message: "Xush kelibsiz, Admin!" });
});

export default router;