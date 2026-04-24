import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import { InsertUser } from "../shared/schema.js";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js"; // Assuming storage is still needed for user lookups
import { pool } from "./db.js"; // Import the exported pool
import ConnectPgSimple from "connect-pg-simple"; // Import connect-pg-simple
import { User as SelectUser } from "../shared/schema.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    console.log('Comparing passwords...');
    console.log('Stored password format:', stored);
    
    // Handle case where stored might be empty or null
    if (!stored) {
      console.error('No stored password provided');
      return false;
    }
    
    // Check if password is in the expected format with salt
    if (stored.includes('.')) {
      const [hashed, salt] = stored.split(".");
      if (!hashed || !salt) {
        console.error('Invalid stored password format');
        return false;
      }
      
      console.log('Extracted salt:', salt);
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log('Password comparison result:', result);
      return result;
    } else {
      console.error('Invalid password format - no salt separator');
      return false;
    }
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Initialize PostgreSQL session store
  const PgSessionStore = ConnectPgSimple(session);
  const sessionStore = new PgSessionStore({
    pool: pool, // Use the imported pool
    tableName: 'user_sessions', // Optional: specify table name
    createTableIfMissing: true, // Optional: create table if it doesn't exist
  });

  // Enhanced session configuration using PostgreSQL store
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sqamtho-session-secret-key",
    resave: true,
    saveUninitialized: true, 
    store: sessionStore, 
    cookie: {
      secure: false, 
      sameSite: 'lax', 
      maxAge: 1000 * 60 * 60 * 24 * 7, 
      httpOnly: true,
      path: '/',
    },
    name: 'sqamtho.sid', 
    proxy: true 
  };
  
  console.log('Session settings configured with SameSite: lax');
  
  console.log('Setting up authentication...');

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log('Login attempt for username:', username);
      try {
        const user = await storage.getUserByUsername(username);
        console.log('User found:', user ? 'yes' : 'no');
        
        if (!user) {
          console.log('User not found');
          return done(null, false);
        }
        
        // Try to use password field, fall back to password_hash if needed
        const storedPassword = (user as any).password || (user as any).password_hash;
        const passwordMatch = await comparePasswords(password, storedPassword);
        console.log('Password match:', passwordMatch ? 'yes' : 'no');
        
        if (!passwordMatch) {
          return done(null, false);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', { id: user.id, username: user.username });
    done(null, user.id);
  });
  passport.deserializeUser(async (id: number, done) => {
    console.log('Deserializing user id:', id);
    try {
      const user = await storage.getUser(id);
      console.log('Deserialized user found:', user ? { id: user.id, username: user.username } : 'null');
      done(null, user);
    } catch (err) {
      console.error('Error deserializing user:', err);
      done(err, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password: rawPassword, displayName, bio, profilePicture, location, email } = req.body;

      // Validate required fields
      if (!username || !displayName || !rawPassword || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check for existing user by username or email
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (!storage.getUserByEmail) {
        // Developer note: You must implement getUserByEmail in your storage layer for email uniqueness to work!
        return res.status(500).json({ message: "Email uniqueness check not implemented in storage layer" });
      }
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user: InsertUser = {
        username,
        displayName: displayName || username,
        email,
        password_hash: await hashPassword(rawPassword),
        bio: bio || "",
        profilePicture: profilePicture || "",
        location: location || "",
      };

      console.log("User object before createUser:", user);

      const createdUser = await storage.createUser(user);

      // Remove password from response
      const { password_hash: _, ...userWithoutPassword } = createdUser; // Use password_hash

      req.login(createdUser, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url,
      session: req.session,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });

    passport.authenticate('local', (err: any, user: Express.User | false, info: { message: string }) => {
      console.log('Passport authenticate callback:', { err, user: user ? 'exists' : 'none', info });

      if (err) {
        console.error('Login error details:', {
          error: err,
          stack: err.stack,
          message: err.message
        });
        return res.status(500).json({
          message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? err : undefined
        });
      }

      if (!user) {
        console.log('Authentication failed:', {
          info,
          username: req.body.username
        });
        return res.status(401).json({ message: info?.message || 'Invalid username or password' });
      }

      req.logIn(user, (err: any) => {
        if (err) {
          console.error('Session error details:', {
            error: err,
            stack: err.stack,
            message: err.message
          });
          return res.status(500).json({
            message: process.env.NODE_ENV === 'development' ? err.message : 'Error establishing session',
            error: process.env.NODE_ENV === 'development' ? err : undefined
          });
        }

        console.log('Login successful:', {
          userId: user.id,
          username: user.username,
          session: req.session?.id
        });

        // Remove password from response
        const userWithoutPassword = { ...user };
        delete (userWithoutPassword as any).password;
        delete (userWithoutPassword as any).password_hash;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('API /api/user called:', {
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      session: req.session,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
    
    if (!req.isAuthenticated() || !req.user) {
      console.log('API [auth] /api/user: User not authenticated or req.user missing', {
        sessionID: req.sessionID,
        sessionUserId: (req.session as any)?.userId
      });
      return res.sendStatus(401);
    }
    
    // Use object spread to create a new object without the password
    const userObj = req.user as SelectUser;
    const userWithoutPassword = { ...userObj };
    delete (userWithoutPassword as any).password;
    
    res.json(userWithoutPassword);
  });
}
