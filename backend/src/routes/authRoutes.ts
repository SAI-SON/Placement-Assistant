import { Router } from 'express';
import {
  handleSignup,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleGetMe,
  handleUpdateProfile,
  handleChangePassword,
} from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

export const authRouter = Router();

authRouter.post('/signup', handleSignup);
authRouter.post('/login', handleLogin);
authRouter.post('/forgot-password', handleForgotPassword);
authRouter.post('/reset-password', handleResetPassword);
authRouter.get('/me', requireAuth, handleGetMe);
authRouter.put('/profile', requireAuth, handleUpdateProfile);
authRouter.put('/change-password', requireAuth, handleChangePassword);
