import express from "express";
import { uploadJob, validatePdfMagic, handleUploadError } from "../middleware/upload.js";
import { parseJobPdf } from "../middleware/parsePdf.js";
import { parseLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { aiTimeout } from "../middleware/timeout.js";
import { analyzeJob } from "../controllers/job.controller.js";
import { concurrencyLimit } from "../middleware/concurrency.js";

const router = express.Router();

// POST /api/jobs/analyze
// Accepts: multipart/form-data "job" field (PDF), or plain { jobText } in body
router.post(
  "/analyze",
  concurrencyLimit(5), // 0. Concurrency Limit
  parseLimiter, // 1. rate limit
  uploadJob, // 2. multer: buffer + MIME check
  validatePdfMagic, // 3. magic byte check
  validate("analyzeJob"), // 4. validate text body if no file provided
  parseJobPdf, // 5. extract text from PDF buffer
  handleUploadError, // 6. catch multer errors
  aiTimeout, // 7. 90s hard deadline
  analyzeJob, // 8. controller
);

export default router;
