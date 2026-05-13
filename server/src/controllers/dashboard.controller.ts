import { Request, Response } from "express";
import Application from "../models/Application.js";

// GET /api/dashboard/:cvId
// Returns aggregated stats for all applications made with a given CV
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;

    const applications = await Application.find({ cv: cvId })
      .select("match.score match.confidence status createdAt job") // explicit projection
      .populate("job", "parsed.title")
      .lean();

    if (!applications.length) {
      return res.json({
        total: 0,
        average_score: 0,
        highest_score: null,
        status_breakdown: {},
        confidence_breakdown: {},
        applications: [],
      });
    }

    // ── Aggregations ──────────────────────────────────────────────
    const scores = applications.map((a) => a.match?.score ?? 0).filter((s) => s > 0);

    const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const highestScore = scores.length ? Math.max(...scores) : 0;

    const bestMatch = applications.find((a) => (a.match?.score ?? 0) === highestScore);

    // Count by status
    const statusBreakdown = applications.reduce<Record<string, number>>((acc, a) => {
      const s = (a.status as string) ?? "generated";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});

    // Count by confidence
    const confidenceBreakdown = applications.reduce<Record<string, number>>((acc, a) => {
      const c = (a.match?.confidence as string) ?? "low";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {});

    // Slim summary per application for the dashboard list
    const summaries = applications.map((a) => ({
      _id: a._id,
      job_title: (a.job as any)?.parsed?.title ?? "Unknown",
      score: a.match?.score ?? 0,
      confidence: a.match?.confidence ?? "low",
      status: a.status ?? "generated",
      createdAt: a.createdAt,
    }));

    return res.json({
      total: applications.length,
      average_score: averageScore,
      highest_score: highestScore,
      best_match_id: bestMatch?._id ?? null,
      status_breakdown: statusBreakdown,
      confidence_breakdown: confidenceBreakdown,
      applications: summaries,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[getDashboard]", message);
    return res.status(500).json({ error: message });
  }
};
