import { Router } from 'express';
import { handleGetDashboard } from '../controllers/dashboardController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', optionalAuth, handleGetDashboard);

export default router;
