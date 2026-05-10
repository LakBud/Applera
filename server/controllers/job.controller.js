import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractJobData } from "../services/extractors.service.js";

export const analyzeJob = async (req, res) => {
  try {
    // Support two input paths (mirrors cv.controller.js):
    //   1. PDF upload  → req.file.buffer
    //   2. Plain text  → req.body.jobText
    let rawText;

    if (req.file?.buffer) {
      rawText = await extractTextFromPdf(req.file.buffer);
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
  } catch (err) {
    const status = err instanceof TypeError ? 400 : 500;
    console.error("[analyzeJob]", err.message);
    return res.status(status).json({ error: err.message });
  }
};
