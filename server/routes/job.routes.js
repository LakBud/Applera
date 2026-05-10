import express from "express";
import { uploadJob, handleUploadError } from "../middleware/upload.js";
import { parseJobPdf } from "../middleware/parsePdf.js";
import { analyzeJob } from "../controllers/job.controller.js";

const router = express.Router();

// POST /api/jobs/analyze
// Accepts: multipart/form-data "job" field (PDF), or plain { jobText } in body
router.post(
  "/analyze",
  uploadJob, // 1. multer: populates req.file
  parseJobPdf, // 2. extracts text from PDF → req.pdfText (no-op if no file)
  handleUploadError, // 3. catches multer errors as clean 400s
  analyzeJob, // 4. controller
);

export default router;
