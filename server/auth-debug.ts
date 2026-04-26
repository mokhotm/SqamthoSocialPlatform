// auth-debug.ts
import { Request, Response, NextFunction } from 'express';

// Middleware to log all authentication-related requests
export function authDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only log authentication routes
  if (req.path.includes('/api/login') || req.path.includes('/api/register') || req.path.includes('/api/user')) {
    console.log(`\n=== AUTH DEBUG ===`);
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Session:', req.session);
    console.log('Session ID:', req.sessionID);
    
    // Capture the original send method to log responses
    const originalSend = res.send;
    res.send = function(body) {
      console.log(`\n=== AUTH RESPONSE ===`);
      console.log(`${new Date().toISOString()} - Response for ${req.method} ${req.path}`);
      console.log('Status:', res.statusCode);
      console.log('Response Headers:', res.getHeaders());
      try {
        if (typeof body === 'string' && body.startsWith('{')) {
          console.log('Response Body:', JSON.parse(body));
        } else {
          console.log('Response Body:', body);
        }
      } catch (e) {
        console.log('Response Body: [Cannot parse]', body);
      }
      
      return originalSend.call(this, body);
    };
  }
  
  next();
}