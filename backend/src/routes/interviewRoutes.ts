import { Router } from 'express';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getInterviewSessions,
} from '../controllers/interviewController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(optionalAuth);

router.post('/generate-questions', generateInterviewQuestions);
router.post('/evaluate-answer', evaluateInterviewAnswer);
router.get('/sessions', getInterviewSessions);

export default router;
