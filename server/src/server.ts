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
import { sanitizeHpp } from "./middleware/sanitize.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { stripObject } from "./utils/utils.js";

import { clerkMiddleware } from "@clerk/express";
import { CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY } from "./config/env.js";
import { attachIdentity } from "./middleware/identity.js";
import cookieParser from "cookie-parser";
import { guestUsageLimiter } from "./middleware/usageLimiter.js";

const app: express.Application = express();

const PORT: number = Number(process.env.PORT) || 5005;
const IS_PROD: boolean = process.env.NODE_ENV === "production";

// ─────────────────────────────────────────────
// Core security middleware
// ─────────────────────────────────────────────

if (IS_PROD) app.set("trust proxy", 1);

app.use(helmet());
app.use(requestLogger);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

app.use(clerkMiddleware({ publishableKey: CLERK_PUBLISHABLE_KEY, secretKey: CLERK_SECRET_KEY }));

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

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", guestUsageLimiter, applicationRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
