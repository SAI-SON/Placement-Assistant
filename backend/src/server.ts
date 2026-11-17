import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { initDatabase, pool } from './config/db';
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend applications
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// High payload limit for base64 resumes and PDFs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(requestLogger);

// Root welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Placement Assistant API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      resumeAnalyze: 'POST /api/resume/analyze',
      resumeHistory: 'GET /api/resume/history',
      resumeGenerate: 'POST /api/resume/generate',
      interviewGenerate: 'POST /api/interview/generate-questions',
      interviewEvaluate: 'POST /api/interview/evaluate-answer',
      coachChat: 'POST /api/coach/chat',
      learningSuggestions: 'POST /api/learning/suggestions',
      news: 'GET /api/news?state=...&district=...',
      youtube: 'GET /api/youtube?topic=...',
    },
  });
});

// Mount all API endpoints
app.use('/api', apiRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler middleware
app.use(errorHandler);

// Start server after verifying database connection
async function startServer() {
  try {
    await initDatabase();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Placement Assistant Backend is running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`💾 Connected to PostgreSQL (Database: Placement)`);
      console.log(`=======================================================`);
    });

    const shutdown = async () => {
      console.log('\n[Express] Gracefully shutting down...');
      server.close(async () => {
        await pool.end();
        console.log('[PostgreSQL] Pool closed. Server exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
