import { Request, Response } from 'express';

import Application from '../models/Application.js';
import CV from '../models/CV.js';
import { getParam } from '../utils/req.js';

// ─────────────────────────────────────────────
// Route params
// ─────────────────────────────────────────────

// GET /api/dashboard/:cvId
// Returns aggregated stats for all applications made with a given CV
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const cvId = getParam(req.params.cvId);

    const identity = req.identity;

    if (!identity) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const ownerId = identity.id;
    const ownerType = identity.type;

    // ── CV ownership check ─────────────────────────────
    const cvDoc = await CV.findOne({
      _id: cvId,
      ownerId,
      ownerType,
    }).lean();

    if (!cvDoc) {
      return res.status(404).json({
        error: 'CV not found',
      });
    }

    // ── Applications ───────────────────────────────────
    const applications = await Application.find({
      ownerId,
      ownerType,
      cv: cvDoc._id,
    })
      .select('match status createdAt jobTitleSnapshot companySnapshot locationSnapshot')
      .sort({ createdAt: -1 })
      .lean();

    if (applications.length === 0) {
      return res.json({
        cv_id: cvDoc._id,
        total: 0,
        average_score: 0,
        highest_score: 0,
        best_match_id: null,
        status_breakdown: {},
        confidence_breakdown: {},
        applications: [],
      });
    }

    // ── Score calculations ─────────────────────────────
    const scores = applications
      .map((a) => a.match?.score)
      .filter((s): s is number => typeof s === 'number');

    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const bestMatch = applications.find((a) => a.match?.score === highestScore) ?? null;

    // ── Breakdowns ─────────────────────────────────────
    const statusBreakdown = applications.reduce<Record<string, number>>((acc, a) => {
      const status = a.status ?? 'generated';
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    const confidenceBreakdown = applications.reduce<Record<string, number>>((acc, a) => {
      const confidence = a.match?.confidence ?? 'low';
      acc[confidence] = (acc[confidence] ?? 0) + 1;
      return acc;
    }, {});

    // ── Lightweight summaries ──────────────────────────
    const summaries = applications.map((a) => ({
      _id: a._id,
      job_title: a.jobTitleSnapshot || 'Unknown Role',
      company: a.companySnapshot || 'Unknown Company',
      location: a.locationSnapshot || '',
      score: a.match?.score ?? 0,
      confidence: a.match?.confidence ?? 'low',
      status: a.status ?? 'generated',
      createdAt: a.createdAt,
    }));

    return res.json({
      cv_id: cvDoc._id,
      total: applications.length,
      average_score: averageScore,
      highest_score: highestScore,
      best_match_id: bestMatch?._id ?? null,
      status_breakdown: statusBreakdown,
      confidence_breakdown: confidenceBreakdown,
      applications: summaries,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    console.error('[getDashboard]', message);

    return res.status(500).json({
      error: message,
    });
  }
};
