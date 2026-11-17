import { Router } from 'express';
import {
  analyzeResume,
  getResumeHistory,
  generateResume,
  getSavedResumes,
} from '../controllers/resumeController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(optionalAuth);

router.post('/analyze', analyzeResume);
router.get('/history', getResumeHistory);
router.post('/generate', generateResume);
router.get('/saved', getSavedResumes);

export default router;
