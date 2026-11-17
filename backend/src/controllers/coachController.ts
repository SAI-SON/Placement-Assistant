import { Request, Response } from 'express';
import { query } from '../config/db';
import { getCoachFeedbackWithGemini } from '../services/geminiService';

export async function sendChatMessage(req: Request, res: Response): Promise<void> {
  try {
    const { query: userQuery, sessionId } = req.body;

    if (!userQuery || typeof userQuery !== 'string') {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    const session = sessionId || 'default_session';

    // Store user message in PostgreSQL
    await query(
      `
      INSERT INTO chat_messages (session_id, role, content)
      VALUES ($1, $2, $3)
      `,
      [session, 'user', userQuery]
    );

    const { feedback } = await getCoachFeedbackWithGemini(userQuery);

    // Store assistant response in PostgreSQL
    await query(
      `
      INSERT INTO chat_messages (session_id, role, content)
      VALUES ($1, $2, $3)
      `,
      [session, 'assistant', feedback]
    );

    res.json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error('[CoachController] Error generating feedback:', error);
    res.status(500).json({
      error: error.message || 'Failed to get coach feedback',
    });
  }
}

export async function getChatHistory(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = (req.query.sessionId as string) || 'default_session';

    const result = await query(
      `
      SELECT id, role, content, created_at
      FROM chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT 100
      `,
      [sessionId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('[CoachController] Error fetching chat history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch chat history' });
  }
}
