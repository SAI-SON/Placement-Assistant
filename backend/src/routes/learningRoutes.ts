import { Router } from 'express';
import { getLearningSuggestions, getLearningHistory } from '../controllers/learningController';

const router = Router();

router.post('/suggestions', getLearningSuggestions);
router.get('/history', getLearningHistory);

export default router;
