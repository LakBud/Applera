// Extracts plain text from an uploaded PDF and attaches it to the request.
// Must run after the matching multer middleware (uploadCV / uploadJob).
//
// Route example:
//   router.post("/cv",  uploadCV,  parseCvPdf,  handleUploadError, cvController.uploadCV);
//   router.post("/job", uploadJob, parseJobPdf, handleUploadError, jobController.analyzeJob);

import { extractTextFromPdf } from "../lib/pdfParser.js";

// ── Shared factory ────────────────────────────────────────────────────────────
// Both parsers are identical except for the field name used in error messages,
// so we build them from one function instead of duplicating logic.

function makePdfParser(fieldLabel) {
  return async function parsePdf(req, res, next) {
    // If no file was uploaded the controller will handle it —
    // this middleware is a no-op so text-only routes still work.
    if (!req.file) return next();

    try {
      const text = await extractTextFromPdf(req.file.buffer);
      req.pdfText = text; // generic key; controller reads req.file or req.pdfText
      next();
    } catch (err) {
      // extractTextFromPdf throws with a user-friendly message for scanned PDFs
      return res.status(400).json({
        error: `Could not extract text from ${fieldLabel} PDF: ${err.message}`,
      });
    }
  };
}

// ── Exported middleware ───────────────────────────────────────────────────────

export const parseCvPdf = makePdfParser("CV");
export const parseJobPdf = makePdfParser("job");
