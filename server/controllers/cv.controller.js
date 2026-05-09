import { extractCVData } from "../services/ai.service.js";

export const uploadCV = async (req, res) => {
  try {
    const text = req.cvText; // from pdf step
    if (!text) {
      return res.status(400).json({ error: "No CV text available from upload." });
    }

    const structured = await extractCVData(text);

    res.json({
      message: "Success!",
      rawText: text,
      structured,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
