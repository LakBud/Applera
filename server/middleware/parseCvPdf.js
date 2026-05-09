import { extractTextFromPdfBuffer } from "../services/pdf.service.js";

export const parseCvPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "CV file is required (form-data key: cv)." });
    }

    const text = await extractTextFromPdfBuffer(req.file.buffer);

    if (!text) {
      return res.status(400).json({ error: "Could not extract text from PDF." });
    }

    req.cvText = text;
    next();
  } catch (err) {
    res.status(500).json({ error: `Failed to parse PDF: ${err.message}` });
  }
};
