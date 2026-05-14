import { Request, Response } from "express";

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractJobData } from "../services/extractors.service.js";
import { auditLog } from "../middleware/log/audit.logger.js";

// ── Request body type ─────────────────────────────────────────────
type AnalyzeJobBody = {
  jobText?: string;
};

// ── Multer file type ───────────────────────────────────────────────
type UploadedFile = Express.Multer.File;

export const analyzeJob = async (req: Request<{}, {}, AnalyzeJobBody>, res: Response) => {
  try {
    if (!req.identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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

    await auditLog({
      event: "JOB_ANALYZED",
      userId: req.identity.id,
      userType: req.identity.type,
      requestId: req.requestId,
      ip: req.ip,
      metadata: {
        jobTitle: structured.title,
        seniority: structured.seniority,
      },
    });

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
