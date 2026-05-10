import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "./db/db.js";
import cvRoutes from "./routes/cv.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { sanitizeHpp } from "./middleware/sanitize.js";

const app = express();

const PORT: number = Number(process.env.PORT) || 5005;
const IS_PROD: boolean = process.env.NODE_ENV === "production";
const API_KEY: string | undefined = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing required environment variable: API_KEY");
  process.exit(1);
}

if (IS_PROD) app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── NoSQL sanitiser ───────────────────────────────────────────────
function stripObject(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const value = (obj as Record<string, unknown>)[key];

    if (key.startsWith("$") || key.includes(".")) {
      delete (obj as Record<string, unknown>)[key];
    } else {
      stripObject(value);
    }
  }
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  stripObject(req.body);
  stripObject(req.params);
  next();
});

app.use(sanitizeHpp);
app.use(globalLimiter);

// ── Health check ────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

// ── Auth guard ──────────────────────────────────────────────────
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"] ?? "";
  const token = typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  next();
});

// ── Routes ───────────────────────────────────────────────────────
app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

// ── Global error handler ─────────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server]", err);

  const message = err instanceof Error ? err.message : "Unknown server error";

  res.status(500).json({
    error: IS_PROD ? "An unexpected error occurred." : message,
  });
});

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
