import { Request, Response, NextFunction } from 'express';

// Get the authenticated user ID from session
export const getAuthenticatedUserId = (req: Request): number | null => {
  console.log(`[Auth Check] Path: ${req.path}, SessionID: ${req.sessionID}`);
  
  // First check if there's a authenticated user from Passport
  if (req.user && typeof req.user.id === 'number') {
    console.log(`[Auth Check] Authenticated via Passport: User ID ${req.user.id}`);
    return req.user.id;
  }

  // Check if there's a authenticated user ID in the session
  if ((req.session as any)?.userId) {
    console.log(`[Auth Check] Authenticated via Session.userId: ${(req.session as any).userId}`);
    return (req.session as any).userId;
  }
  
  console.log('[Auth Check] Not authenticated');
  return null;
}

// Middleware to require authentication on routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = getAuthenticatedUserId(req);
  
  if (!userId) {
    console.log(`[Auth Middleware] Failed for ${req.path}: No user ID in session`);
    return res.status(401).json({ 
      message: 'Authentication required',
      path: req.path,
      hasSession: !!req.session,
      sessionID: req.sessionID
    });
  }
  
  // User is authenticated
  console.log(`[Auth Middleware] Success for ${req.path}, User ID: ${userId}`);
  next();
};
