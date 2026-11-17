import { Request, Response } from 'express';
import { query } from '../config/db';
import { ApiResponse } from '../types/api';

export interface DashboardData {
  user: {
    name: string;
    email: string;
    target_role: string;
    location: string;
    bio?: string;
  } | null;
  metrics: {
    atsScore: number | null;
    resumeFileName: string | null;
    resumeScanDate: string | null;
    totalResumesAnalyzed: number;
    totalMockInterviews: number;
    totalSavedResumes: number;
    totalCoachMessages: number;
  };
  latestResumeAnalysis: {
    id: number;
    file_name: string;
    score: number;
    summary: string;
    what_we_loved: string[];
    whats_holding_you_back: string[];
    improvements: Array<{ title: string; whatsWrong: string; howToFix: string }>;
    created_at: string;
  } | null;
  recentInterviews: Array<{
    id: number;
    session_id: string;
    job_description: string;
    overall_score: number;
    status: string;
    created_at: string;
  }>;
  recentSavedResumes: Array<{
    id: number;
    name: string;
    role: string;
    created_at: string;
  }>;
  recentNews: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
  }>;
}

export async function handleGetDashboard(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user ? req.user.id : null;

    // 1. Fetch latest real resume analysis
    let resumeQuery = 'SELECT * FROM resume_analyses ORDER BY id DESC LIMIT 1';
    let resumeParams: any[] = [];

    if (userId) {
      resumeQuery = 'SELECT * FROM resume_analyses WHERE user_id = $1 OR user_id IS NULL ORDER BY id DESC LIMIT 1';
      resumeParams = [userId];
    }

    const resumeRes = await query(resumeQuery, resumeParams);
    const latestAnalysis = resumeRes.rows[0] || null;

    // 2. Fetch counts
    const countResumes = await query('SELECT COUNT(*) AS count FROM resume_analyses');
    const countInterviews = await query('SELECT COUNT(*) AS count FROM interview_sessions');
    const countSavedResumes = await query('SELECT COUNT(*) AS count FROM saved_resumes');
    const countCoachMessages = await query('SELECT COUNT(*) AS count FROM chat_messages');

    // 3. Fetch recent real interview sessions
    let interviewQuery = 'SELECT id, session_id, job_description, overall_score, status, created_at FROM interview_sessions ORDER BY id DESC LIMIT 5';
    let interviewParams: any[] = [];
    if (userId) {
      interviewQuery = 'SELECT id, session_id, job_description, overall_score, status, created_at FROM interview_sessions WHERE user_id = $1 OR user_id IS NULL ORDER BY id DESC LIMIT 5';
      interviewParams = [userId];
    }
    const interviewsRes = await query(interviewQuery, interviewParams);

    // 4. Fetch recent real saved resumes from resume generator
    let savedResumesQuery = 'SELECT id, name, role, created_at FROM saved_resumes ORDER BY id DESC LIMIT 5';
    let savedResumesParams: any[] = [];
    if (userId) {
      savedResumesQuery = 'SELECT id, name, role, created_at FROM saved_resumes WHERE user_id = $1 OR user_id IS NULL ORDER BY id DESC LIMIT 5';
      savedResumesParams = [userId];
    }
    const savedResumesRes = await query(savedResumesQuery, savedResumesParams);

    // 5. Fetch real news articles from cached_news
    const newsRes = await query('SELECT articles FROM cached_news ORDER BY id DESC LIMIT 1');
    let recentNews: any[] = [];
    if (newsRes.rowCount && newsRes.rowCount > 0 && Array.isArray(newsRes.rows[0].articles)) {
      recentNews = newsRes.rows[0].articles.slice(0, 3).map((a: any) => ({
        title: a.title,
        source: a.source?.name || 'Tech Radar',
        url: a.url,
        publishedAt: a.publishedAt,
      }));
    }

    const dashboardPayload: DashboardData = {
      user: req.user
        ? {
            name: req.user.name,
            email: req.user.email,
            target_role: req.user.target_role || 'Full-Stack Developer',
            location: req.user.location || 'India',
            bio: req.user.bio || undefined,
          }
        : null,
      metrics: {
        atsScore: latestAnalysis ? latestAnalysis.score : null,
        resumeFileName: latestAnalysis ? latestAnalysis.file_name : null,
        resumeScanDate: latestAnalysis ? latestAnalysis.created_at : null,
        totalResumesAnalyzed: parseInt(countResumes.rows[0]?.count || '0', 10),
        totalMockInterviews: parseInt(countInterviews.rows[0]?.count || '0', 10),
        totalSavedResumes: parseInt(countSavedResumes.rows[0]?.count || '0', 10),
        totalCoachMessages: parseInt(countCoachMessages.rows[0]?.count || '0', 10),
      },
      latestResumeAnalysis: latestAnalysis
        ? {
            id: latestAnalysis.id,
            file_name: latestAnalysis.file_name,
            score: latestAnalysis.score,
            summary: latestAnalysis.summary,
            what_we_loved: Array.isArray(latestAnalysis.what_we_loved)
              ? latestAnalysis.what_we_loved
              : JSON.parse(latestAnalysis.what_we_loved || '[]'),
            whats_holding_you_back: Array.isArray(latestAnalysis.whats_holding_you_back)
              ? latestAnalysis.whats_holding_you_back
              : JSON.parse(latestAnalysis.whats_holding_you_back || '[]'),
            improvements: Array.isArray(latestAnalysis.improvements)
              ? latestAnalysis.improvements
              : JSON.parse(latestAnalysis.improvements || '[]'),
            created_at: latestAnalysis.created_at,
          }
        : null,
      recentInterviews: interviewsRes.rows.map((row) => ({
        id: row.id,
        session_id: row.session_id,
        job_description: row.job_description || 'General Technical Interview',
        overall_score: row.overall_score || 0,
        status: row.status || 'active',
        created_at: row.created_at,
      })),
      recentSavedResumes: savedResumesRes.rows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        created_at: row.created_at,
      })),
      recentNews,
    };

    const response: ApiResponse<DashboardData> = {
      success: true,
      data: dashboardPayload,
    };
    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Dashboard] Error fetching telemetry:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load dashboard telemetry.',
    });
  }
}
