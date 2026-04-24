import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import cors from "cors";
import session from "express-session";
import { storage } from "./storage.js";

const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`); // Added log
  next();
});

// Configure session middleware first
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure CORS to allow requests from any origin in development mode
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development mode
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON body size limit to 10MB to accommodate image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Enhanced request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  console.log(`Request received: ${req.method} ${path}`);
  
  if (req.headers['content-type'] === 'application/json' && req.method !== 'GET') {
    console.log(`Request body: ${JSON.stringify(req.body)}`);
  }
  
  // Intercept json responses to log them
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? 'ERROR' : 'OK';
    
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${statusCode} (${statusColor}) in ${duration}ms`;
      
      if (capturedJsonResponse) {
        let responseStr = JSON.stringify(capturedJsonResponse);
        // Truncate long responses
        if (responseStr.length > 80) {
          responseStr = responseStr.slice(0, 79) + "…";
        }
        logLine += ` :: ${responseStr}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (app.get("env") === "development") {
      console.error("Error:", err.stack); // Log the error stack in development
      message = err.message; // Return specific error message in development
    } else {
      message = "Internal Server Error"; // Generic message in production
    }

    res.status(status).json({ message });
  });



  // Use port 8000 for the API server
  const port = 8000;
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort: true, // ENOTSUP error on some systems
  }, () => {
    log(`serving on port ${port}`);
  });
})();
