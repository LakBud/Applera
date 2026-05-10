import express from "express";
import { uploadCV, handleUploadError } from "../middleware/upload.js"; // named export, not default
import { parseCvPdf } from "../middleware/parsePdf.js"; // correct path
import { uploadCV as uploadCVController } from "../controllers/cv.controller.js";

const router = express.Router();

// POST /api/cv/upload
// Accepts: multipart/form-data "cv" field (PDF), or plain { cvText } in body
router.post(
  "/upload",
  uploadCV, // 1. multer: populates req.file
  parseCvPdf, // 2. extracts text from PDF → req.pdfText (no-op if no file)
  handleUploadError, // 3. catches multer errors (wrong type, too large) as clean 400s
  uploadCVController, // 4. controller
);

export default router;
