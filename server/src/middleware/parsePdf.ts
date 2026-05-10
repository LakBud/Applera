// Extracts plain text from an uploaded PDF and attaches it to the request.
// Must run after the matching multer middleware (uploadCV / uploadJob).
//
// Route example:
//   router.post("/cv",  uploadCV,  parseCvPdf,  handleUploadError, cvController.uploadCV);
//   router.post("/job", uploadJob, parseJobPdf, handleUploadError, jobController.analyzeJob);

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { Request, Response, NextFunction } from "express";

// ── Extend Express Request type ────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      pdfText?: string;
    }
  }
}

// ── Middleware factory ─────────────────────────────────────────────
export function makePdfParser(fieldLabel: string) {
  return async function parsePdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    // If no file was uploaded the controller will handle it —
    // this middleware is a no-op so text-only routes still work.
    if (!req.file) return next();

    try {
      const text = await extractTextFromPdf(req.file.buffer);

      req.pdfText = text; // safely typed via Express augmentation

      next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";

      res.status(400).json({ error: "bad" });
      return;
    }
  };
}

// ── Exported middleware ───────────────────────────────────────────────────────

export const parseCvPdf = makePdfParser("CV");
export const parseJobPdf = makePdfParser("job");
