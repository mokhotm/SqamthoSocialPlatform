import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserJwtPayload {
  id: number;
  username: string;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sqamtho-jwt-secret';
    const user = jwt.verify(token, secret) as UserJwtPayload;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
