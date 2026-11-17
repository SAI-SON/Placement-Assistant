import { Router } from 'express';
import { sendChatMessage, getChatHistory } from '../controllers/coachController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(optionalAuth);

router.post('/chat', sendChatMessage);
router.get('/history', getChatHistory);

export default router;
