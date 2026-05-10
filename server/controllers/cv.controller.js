import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData } from "../services/extractors.service.js";

export const uploadCV = async (req, res) => {
  try {
    // Support two input paths:
    //   1. PDF upload  → req.file.buffer set by multer (memoryStorage)
    //   2. Plain text  → req.body.cvText for clients that paste text directly
    let rawText;

    if (req.file?.buffer) {
      rawText = await extractTextFromPdf(req.file.buffer);
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
  } catch (err) {
    const status = err instanceof TypeError ? 400 : 500;
    console.error("[uploadCV]", err.message);
    return res.status(status).json({ error: err.message });
  }
};
