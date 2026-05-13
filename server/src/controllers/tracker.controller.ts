import { Request, Response } from "express";
import Application, { APPLICATION_STATUSES } from "../models/Application.js";

// GET /api/tracker/:cvId
// Returns all applications for a given CV, sorted newest first
export const getApplicationsByCv = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;

    const applications = await Application.find({ cv: cvId })
      .populate("cv", "-rawText") // return CV without the raw text
      .populate("job", "-rawText")
      .sort({ createdAt: -1 });

    return res.json({ applications });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getApplicationsByCv]", message);
    return res.status(500).json({ error: message });
  }
};

// GET /api/tracker/application/:id
// Returns a single application with full CV + job populated
export const getApplication = async (req: Request, res: Response) => {
  try {
    const application = await Application.findById(req.params.id).populate("cv").populate("job");

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    return res.json({ application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getApplication]", message);
    return res.status(500).json({ error: message });
  }
};

// PATCH /api/tracker/application/:id/status
// Body: { status, notes? }
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(", ")}`,
      });
    }

    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.notes = notes;

    const application = await Application.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    return res.json({ application });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[updateStatus]", message);
    return res.status(500).json({ error: message });
  }
};
