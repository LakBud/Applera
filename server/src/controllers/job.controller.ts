import { Request, Response } from "express";

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractJobData } from "../services/extractors.service.js";

// ── Request body type ─────────────────────────────────────────────
type AnalyzeJobBody = {
  jobText?: string;
};

// ── Multer file type ───────────────────────────────────────────────
type UploadedFile = Express.Multer.File;

export const analyzeJob = async (req: Request<{}, {}, AnalyzeJobBody>, res: Response) => {
  try {
    // Support two input paths (mirrors cv.controller.js):
    //   1. PDF upload  → req.file.buffer
    //   2. Plain text  → req.body.jobText
    let rawText: string;

    const file = req.file as UploadedFile | undefined;

    if (file?.buffer) {
      rawText = await extractTextFromPdf(file.buffer);
    } else if (req.body?.jobText?.trim()) {
      rawText = req.body.jobText.trim();
    } else {
      return res.status(400).json({
        error: "Provide a job listing as a PDF file upload or as plain text in jobText.",
      });
    }

    const structured = await extractJobData(rawText);

    return res.status(200).json({
      message: "Job parsed successfully.",
      rawText,
      structured,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    const status = err instanceof TypeError ? 400 : 500;

    console.error("[analyzeJob]", message);

    return res.status(status).json({ error: message });
  }
};
