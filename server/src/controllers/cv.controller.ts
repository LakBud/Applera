import { Request, Response } from "express";

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData } from "../services/extractors.service.js";

// ── Request body type ─────────────────────────────────────────────
type UploadCVBody = {
  cvText?: string;
};

// ── Multer file type (safe minimal version) ────────────────────────
type UploadedFile = Express.Multer.File;

export const uploadCV = async (req: Request<{}, {}, UploadCVBody>, res: Response) => {
  try {
    // Support two input paths:
    //   1. PDF upload  → req.file.buffer set by multer (memoryStorage)
    //   2. Plain text  → req.body.cvText for clients that paste text directly
    let rawText: string;

    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
    } else if (req.body?.cvText?.trim()) {
      rawText = req.body.cvText.trim();
    } else {
      return res.status(400).json({
        error: "Provide a CV as a PDF file upload or as plain text in cvText.",
      });
    }

    const structured = await extractCVData(rawText);

    return res.status(200).json({
      message: "CV parsed successfully.",
      rawText,
      structured,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    const status = err instanceof TypeError ? 400 : 500;

    console.error("[uploadCV]", message);

    return res.status(status).json({ error: message });
  }
};
