import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protectAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protectAdmin, authController.getMe);

export default router;
