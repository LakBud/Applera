import express from "express";
import cors from "cors";

import { connectDB } from "./db/db.js";
import cvRoutes from "./routes/cv.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/application.routes.js";

const app = express();
const PORT = process.env.PORT || 5005;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api/cv", cvRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/application", applicationRoutes);

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handler ──────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error("[server]", err.message);
  res.status(500).json({ error: err.message });
});

// ── Start: DB first, then server ──────────────────────────────────────────────
// If the DB connection fails the server never starts — avoids a
// running server that crashes on every request.

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start();
