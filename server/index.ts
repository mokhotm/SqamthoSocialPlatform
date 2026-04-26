import express from "express";
import path from "path"; // Import path module
import { fileURLToPath } from "url"; // For ES module __dirname equivalent
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./viteSetup.js";
import cors from "cors";
import { storage } from "./storage.js";

const app = express();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'uploads' directory
// Match the path used in routes.ts for file uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
console.log(
  "Serving static files from:",
  path.join(__dirname, "..", "uploads")
);

// Configure CORS to allow requests from Vite dev server
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "http://127.0.0.1:56865",
      "http://127.0.0.1:53375",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Enable pre-flight requests
app.options("*", cors());

console.log("CORS configured for development servers at ports 5173");

// Increase JSON body size limit to 10MB to accommodate image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Import and use authentication debugging middleware
import { authDebugMiddleware } from "./auth-debug.js";
app.use(authDebugMiddleware);
console.log("Authentication debugging middleware enabled");

import { setupTelegramBot } from "./telegram.js";

// Explicitly disable proxy for Telegram bot to avoid SSL issues in some environments
// process.env.HTTPS_PROXY = "";
// process.env.HTTP_PROXY = "";
// process.env.https_proxy = "";
// process.env.http_proxy = "";

try {
  setupTelegramBot("8774402177:AAF6D3vphfFiTlEibGeaQRUQhe8MK0JRhSs"); // Initialize Telegram integration
  console.log("Telegram bot setup call completed");
} catch (error) {
  console.error("Failed to start Telegram bot:", error);
}

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

  // Use port 8000 for the API server to match client proxy configuration
  const port = 8000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      // reusePort: true, // ENOTSUP error on some systems
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
