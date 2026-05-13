import { Request, Response } from "express";
import Application, { APPLICATION_STATUSES } from "../models/Application.js";

// GET /api/tracker/:cvId
export const getApplicationsByCv = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const identityId = identity.id;
    const ownerType = identity.type;

    const applications = await Application.find({
      ownerId: identityId,
      ownerType,
      cv: cvId,
    })
      .populate("cv", "-rawText")
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
export const getApplication = async (req: Request, res: Response) => {
  try {
    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const identityId = identity.id;
    const ownerType = identity.type;

    const application = await Application.findOne({
      _id: req.params.id,
      ownerId: identityId,
      ownerType,
    })
      .populate("cv")
      .populate("job");

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
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const identityId = identity.id;
    const ownerType = identity.type;

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

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: identityId,
        ownerType,
      },
      update,
      { new: true },
    );

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
