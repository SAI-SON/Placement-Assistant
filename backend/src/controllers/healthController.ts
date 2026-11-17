import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getHealthStatus(req: Request, res: Response): Promise<void> {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;

  try {
    const dbTest = await query('SELECT NOW() as current_time, current_database() as database_name;');
    if (dbTest.rowCount && dbTest.rowCount > 0) {
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - start;
    }
  } catch (err: any) {
    console.error('[HealthController] Database ping failed:', err.message);
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'ok',
    service: 'Placement Assistant API (Node + Express + PostgreSQL)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      type: 'PostgreSQL 18',
    },
  });
}
