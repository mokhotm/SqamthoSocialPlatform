import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../shared/schema.js';

interface UserJwtPayload {
  id: number;
  username: string;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authorization header:', authHeader); // Log the Authorization header
  console.log('Extracted token:', token); // Log the extracted token

  if (!token) {
    console.error('No token provided in Authorization header'); // Log missing token
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sqamtho-jwt-secret';
    const userPayload = jwt.verify(token, secret) as UserJwtPayload;
    console.log('Decoded user from token:', userPayload); // Log decoded user

    // Map UserJwtPayload to User type
    const user: User = {
      id: userPayload.id,
      username: userPayload.username,
      displayName: '', // Default or fetch from DB if needed
      email: '',
      password_hash: '',
      profilePicture: '',
      bio: '',
      location: '',
    };

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error); // Log token verification error
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
