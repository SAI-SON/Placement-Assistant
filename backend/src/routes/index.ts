import { Router } from 'express';
import { authRouter } from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import resumeRoutes from './resumeRoutes';
import interviewRoutes from './interviewRoutes';
import coachRoutes from './coachRoutes';
import learningRoutes from './learningRoutes';
import newsRoutes from './newsRoutes';
import youtubeRoutes from './youtubeRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/coach', coachRoutes);
router.use('/learning', learningRoutes);
router.use('/news', newsRoutes);
router.use('/youtube', youtubeRoutes);

export default router;
