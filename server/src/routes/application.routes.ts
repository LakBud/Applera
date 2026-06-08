import express from "express";

import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/application.controller.js";

import { applicationLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { aiTimeout } from "../middleware/timeout.js";
import { idempotency } from "../middleware/idempotency.js";
import { usageLimiter } from "../middleware/usageLimiter.js";

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/application
// Create application (LLM pipeline)
// ─────────────────────────────────────────────
router.post(
  "/",
  validate("createApplication"),
  idempotency,
  usageLimiter,
  applicationLimiter,
  aiTimeout(60_000),
  createApplication,
);

// ─────────────────────────────────────────────
// GET /api/application
// List applications
// ─────────────────────────────────────────────
router.get("/", getApplications);

// ─────────────────────────────────────────────
// GET /api/application/:id
// Get single application
// ─────────────────────────────────────────────
router.get("/:id", getApplicationById);

// ─────────────────────────────────────────────
// PATCH /api/application/:id/status
// Update status
// ─────────────────────────────────────────────
router.patch("/:id/status", updateApplicationStatus);

// ─────────────────────────────────────────────
// DELETE /api/application/:id
// Delete application
// ─────────────────────────────────────────────
router.delete("/:id", deleteApplication);

export default router;
