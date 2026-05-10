import express from "express";
import cors from "cors";
import helmet from "helmet";

import { connectDB } from "./db/db.js";
import cvRoutes from "./routes/cv.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { sanitizeHpp } from "./middleware/sanitize.js";

const app = express();
const PORT = process.env.PORT || 5005;
const IS_PROD = process.env.NODE_ENV === "production";
const API_KEY = process.env.API_KEY;

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

// ── NoSQL injection sanitiser ─────────────────────────────────────────────────
app.use((req, _res, next) => {
  const strip = (obj) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) delete obj[key];
      else strip(obj[key]);
    }
  };
  strip(req.body);
  strip(req.params);
  next();
});

app.use(sanitizeHpp);
app.use(globalLimiter);

// ── Health check (public — before auth) ───────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Auth guard — must be BEFORE routes ───────────────────────────────────────
app.use("/api", (req, res, next) => {
  const header = req.headers["authorization"] ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || token !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[server]", err.message);
  res.status(500).json({
    error: IS_PROD ? "An unexpected error occurred." : err.message,
  });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
