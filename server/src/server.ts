import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./db/db.js";

import cvRoutes from "./routes/cv.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import interviewRoutes from "./routes/interviewPrep.routes.js";
import trackerRoutes from "./routes/tracker.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

import { globalLimiter } from "./middleware/rateLimiter.js";
import { sanitizeHpp } from "./middleware/global/sanitize.js";
import { requestLogger } from "./middleware/log/request.logger.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { stripObject } from "./utils/utils.js";

import { clerkMiddleware } from "@clerk/express";
import { attachIdentity } from "./middleware/global/identity.js";
import cookieParser from "cookie-parser";
import { CLIENT_URL } from "./config/env.js";

const app: express.Application = express();

const PORT: number = Number(process.env.PORT) || 5005;
const IS_PROD: boolean = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Core security middleware
// ─────────────────────────────────────────────

if (IS_PROD) app.set("trust proxy", 1);

// Strict CSP via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // tighten if you control styles
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", CLIENT_URL, "http://localhost:5173"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: IS_PROD ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // only enable if you need COEP isolation
  }),
);

// 1. Request ID FIRST
// Also writes X-Request-ID to the response
app.use((req: Request, res: Response, next: NextFunction) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.locals.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
});

// 2. CORS
app.use(
  cors({
    origin: CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

// 3. Webhooks (must be before body parsing)
app.use("/api/webhooks", webhookRoutes);

// 4. Body parsing
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// ─────────────────────────────────────────────
// Health check (public)
// ─────────────────────────────────────────────

const publicRouter = express.Router();

publicRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(publicRouter);

// ─────────────────────────────────────────────
// Clerk middleware (ATTACHES req.auth)
// ─────────────────────────────────────────────

app.use(clerkMiddleware());
app.use(attachIdentity);

// ─────────────────────────────────────────────
// Input sanitisation
// ─────────────────────────────────────────────

app.use((req: Request, _res: Response, next: NextFunction) => {
  stripObject(req.body);
  stripObject(req.params);
  next();
});

app.use(sanitizeHpp);
app.use(globalLimiter);
if (!IS_PROD) app.use(requestLogger);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─────────────────────────────────────────────
// 404 catch-all (must come after all routes)
// ─────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error("[server]", {
    requestId: res.locals.requestId,
    error: err,
  });

  const message = err instanceof Error ? err.message : "Unknown server error";

  res.status(500).json({
    error: IS_PROD ? "An unexpected error occurred." : message,
    requestId: res.locals.requestId,
  });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
