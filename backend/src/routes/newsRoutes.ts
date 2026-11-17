import { Router } from 'express';
import { getJobNews } from '../controllers/newsController';

const router = Router();

router.get('/', getJobNews);

export default router;
