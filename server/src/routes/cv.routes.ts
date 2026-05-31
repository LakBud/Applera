import express from "express";
import { uploadCV, validatePdfMagic, handleUploadError } from "../middleware/upload.js";

import { parseLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { aiTimeout } from "../middleware/timeout.js";
import { concurrencyLimit } from "../middleware/concurrency.js";

import { createCV, getCVs, getCVById, deleteCV, pinCV } from "../controllers/cv.controller.js";
import { parseCvPdf } from "../middleware/parsePdf.js";

const router = express.Router();

/**
 * GET /api/cv
 * List all CVs
 */
router.get("/", getCVs);

/**
 * POST /api/cv
 * Upload CV (file or text)
 */
router.post(
  "/",
  concurrencyLimit(5),
  parseLimiter,
  uploadCV,
  validatePdfMagic,
  validate("uploadCV"),
  parseCvPdf,
  handleUploadError,
  aiTimeout(60_000),
  createCV,
);

/**
 * GET /api/cv/:id
 * Get single CV
 */
router.get("/:id", getCVById);

/**
 * DELETE /api/cv/:id
 * Delete CV
 */
router.delete("/:id", deleteCV);

router.patch("/:id/pin", pinCV);

export default router;
