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
  (req, _res, next) => {
    console.log("A validate");
    next();
  },
  validate("createApplication"),

  (req, _res, next) => {
    console.log("B idempotency");
    next();
  },
  idempotency,

  (req, _res, next) => {
    console.log("C usageLimiter");
    next();
  },
  usageLimiter,

  (req, _res, next) => {
    console.log("D applicationLimiter");
    next();
  },
  applicationLimiter,

  (req, _res, next) => {
    console.log("E aiTimeout");
    next();
  },
  aiTimeout(60_000),

  (req, _res, next) => {
    console.log("F createApplication");
    next();
  },
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
