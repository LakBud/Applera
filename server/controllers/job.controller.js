import { parseJob } from "../services/jobParser.service.js";

export const analyzeJob = async (req, res) => {
  try {
    const jobText = req.body?.jobText;

    if (!jobText) {
      return res.status(400).json({
        error: "jobText is required",
      });
    }

    const result = await parseJob(jobText);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
