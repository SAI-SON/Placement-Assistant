import { Router } from 'express';
import { searchYouTube } from '../controllers/youtubeController';

const router = Router();

router.get('/', searchYouTube);

export default router;
