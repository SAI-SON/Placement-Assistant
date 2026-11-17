import { Request, Response } from 'express';
import { query } from '../config/db';
import { getLearningSuggestionsWithGemini } from '../services/geminiService';

export async function getLearningSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const { resumeScore, areasToImprove, resumeAnalysisId } = req.body;

    const score = Number(resumeScore ?? 0);
    const areas = String(areasToImprove || '');

    const result = await getLearningSuggestionsWithGemini(score, areas);

    // Save suggestions to PostgreSQL
    if (result.videoSuggestions && result.videoSuggestions.length > 0) {
      await query(
        `
        INSERT INTO learning_suggestions (
          resume_analysis_id,
          resume_score,
          areas_to_improve,
          video_suggestions
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          resumeAnalysisId || null,
          score,
          areas,
          JSON.stringify(result.videoSuggestions),
        ]
      );
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[LearningController] Error getting suggestions:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch learning suggestions',
    });
  }
}

export async function getLearningHistory(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `
      SELECT id, resume_score, areas_to_improve, video_suggestions, created_at
      FROM learning_suggestions
      ORDER BY created_at DESC
      LIMIT 20
      `
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[LearningController] Error fetching history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch learning history' });
  }
}
