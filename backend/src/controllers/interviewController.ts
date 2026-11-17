import { Request, Response } from 'express';
import { query } from '../config/db';
import {
  generateInterviewQuestionsWithGemini,
  evaluateInterviewAnswerWithGemini,
} from '../services/geminiService';
import crypto from 'crypto';

export async function generateInterviewQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { resumeDataUri, jobDescription } = req.body;

    if (!resumeDataUri) {
      res.status(400).json({ error: 'resumeDataUri is required' });
      return;
    }

    const { questions } = await generateInterviewQuestionsWithGemini(
      resumeDataUri,
      jobDescription || ''
    );

    const sessionId = 'session_' + crypto.randomUUID();

    // Store interview session in PostgreSQL
    await query(
      `
      INSERT INTO interview_sessions (
        session_id,
        job_description,
        questions,
        status
      )
      VALUES ($1, $2, $3, $4)
      `,
      [sessionId, jobDescription || '', JSON.stringify(questions), 'active']
    );

    res.json({
      success: true,
      sessionId,
      questions,
    });
  } catch (error: any) {
    console.error('[InterviewController] Error generating questions:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate interview questions',
    });
  }
}

export async function evaluateInterviewAnswer(req: Request, res: Response): Promise<void> {
  try {
    const { question, answer, resumeDataUri, jobDescription, sessionId, questionIndex } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: 'Both question and answer are required' });
      return;
    }

    const evaluation = await evaluateInterviewAnswerWithGemini(
      question,
      answer,
      resumeDataUri,
      jobDescription
    );

    // Save answer evaluation in PostgreSQL if sessionId is provided
    if (sessionId) {
      await query(
        `
        INSERT INTO interview_evaluations (
          session_id,
          question_index,
          question,
          user_answer,
          score,
          what_you_did_well,
          how_to_improve
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          sessionId,
          questionIndex ?? 0,
          question,
          answer,
          evaluation.score,
          evaluation.whatYouDidWell,
          evaluation.howToImprove,
        ]
      );
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('[InterviewController] Error evaluating answer:', error);
    res.status(500).json({
      error: error.message || 'Failed to evaluate interview answer',
    });
  }
}

export async function getInterviewSessions(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `
      SELECT s.id, s.session_id, s.job_description, s.questions, s.overall_score, s.created_at,
             COUNT(e.id) as evaluations_count
      FROM interview_sessions s
      LEFT JOIN interview_evaluations e ON s.session_id = e.session_id
      GROUP BY s.id, s.session_id, s.job_description, s.questions, s.overall_score, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 20
      `
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[InterviewController] Error fetching interview sessions:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch interview sessions' });
  }
}
