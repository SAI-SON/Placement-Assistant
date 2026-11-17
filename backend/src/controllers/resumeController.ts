import { Request, Response } from 'express';
import { query } from '../config/db';
import {
  analyzeResumeWithGemini,
  generateResumeWithGemini,
  ResumeGeneratorInput,
} from '../services/geminiService';

export async function analyzeResume(req: Request, res: Response): Promise<void> {
  try {
    const { resumeDataUri, fileName } = req.body;

    if (!resumeDataUri) {
      res.status(400).json({ error: 'resumeDataUri is required' });
      return;
    }

    const analysis = await analyzeResumeWithGemini(resumeDataUri);
    const userId = req.user?.id || req.body.userId || null;

    // Persist analysis to PostgreSQL
    const insertResult = await query(
      `
      INSERT INTO resume_analyses (
        user_id,
        file_name,
        score,
        summary,
        what_we_loved,
        whats_holding_you_back,
        improvements,
        raw_result
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
      `,
      [
        userId,
        fileName || 'uploaded_resume.pdf',
        analysis.score,
        analysis.summary,
        JSON.stringify(analysis.whatWeLoved),
        JSON.stringify(analysis.whatsHoldingYouBack),
        JSON.stringify(analysis.improvements),
        JSON.stringify(analysis),
      ]
    );

    const savedRecord = insertResult.rows[0];

    res.json({
      success: true,
      data: analysis,
      recordId: savedRecord?.id,
      createdAt: savedRecord?.created_at,
    });
  } catch (error: any) {
    console.error('[ResumeController] Error analyzing resume:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze resume',
    });
  }
}

export async function getResumeHistory(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `
      SELECT id, file_name, score, summary, what_we_loved, whats_holding_you_back, improvements, created_at
      FROM resume_analyses
      ORDER BY created_at DESC
      LIMIT 30
      `
    );

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[ResumeController] Error fetching history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch resume history' });
  }
}

export async function generateResume(req: Request, res: Response): Promise<void> {
  try {
    const input: ResumeGeneratorInput = req.body;

    if (!input || !input.name || !input.role) {
      res.status(400).json({ error: 'Candidate name and role are required' });
      return;
    }

    const generated = await generateResumeWithGemini(input);
    const userId = req.user?.id || (req.body as any).userId || null;

    // Save generated resume in PostgreSQL
    const insertResult = await query(
      `
      INSERT INTO saved_resumes (
        user_id,
        name,
        role,
        email,
        phone,
        location,
        linkedin,
        portfolio,
        form_data,
        text_resume,
        formatted_markdown,
        suggestions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at
      `,
      [
        userId,
        input.name,
        input.role,
        input.contact?.email || '',
        input.contact?.phone || '',
        input.contact?.location || '',
        input.contact?.linkedin || '',
        input.contact?.portfolio || '',
        JSON.stringify(input),
        generated.text_resume,
        generated.formatted_resume_markdown,
        JSON.stringify(generated.suggestions),
      ]
    );

    res.json({
      success: true,
      data: generated,
      recordId: insertResult.rows[0]?.id,
    });
  } catch (error: any) {
    console.error('[ResumeController] Error generating resume:', error);
    res.status(500).json({ error: error.message || 'Failed to generate resume' });
  }
}

export async function getSavedResumes(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `
      SELECT id, name, role, email, phone, location, formatted_markdown, suggestions, created_at
      FROM saved_resumes
      ORDER BY created_at DESC
      LIMIT 20
      `
    );

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[ResumeController] Error fetching saved resumes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch saved resumes' });
  }
}
