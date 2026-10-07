import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
