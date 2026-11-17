import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/authService';
import { UserProfile } from '../types/api';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required. Please sign in.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    const user = await getUserById(payload.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User account not found or has been removed.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication session. Please sign in again.',
    });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = verifyToken(token);
      const user = await getUserById(payload.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignored for optional auth
    }
  }

  next();
}
