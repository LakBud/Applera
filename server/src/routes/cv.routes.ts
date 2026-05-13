import express from "express";
import { uploadCV, validatePdfMagic, handleUploadError } from "../middleware/upload.js";
import { parseCvPdf } from "../middleware/parsePdf.js";
import { parseLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { aiTimeout } from "../middleware/timeout.js";
import { uploadCV as uploadCVController } from "../controllers/cv.controller.js";
import { concurrencyLimit } from "../middleware/concurrency.js";

const router = express.Router();

// POST /api/cv/upload
// Accepts: multipart/form-data "cv" field (PDF), or plain { cvText } in body
router.post(
  "/upload",
  concurrencyLimit(5), // 0. Concurrency Limit
  parseLimiter, // 1. rate limit
  uploadCV, // 2. multer: buffer + MIME check
  validatePdfMagic, // 3. magic byte check (catches spoofed MIME)
  validate("uploadCV"), // 4. validate text body if no file provided
  parseCvPdf, // 5. extract text from PDF buffer
  handleUploadError, // 6. catch multer errors
  aiTimeout, // 7. 90s hard deadline
  uploadCVController, // 8. controller
);

export default router;
