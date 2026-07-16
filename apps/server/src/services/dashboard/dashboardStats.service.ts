import type { ApplicationType } from '../../models/Application.js';

type ApplicationSummarySource = Pick<
  ApplicationType,
  'match' | 'status' | 'createdAt' | 'jobTitleSnapshot' | 'companySnapshot' | 'locationSnapshot'
> & { _id: unknown };

export function buildDashboardStats(cvId: unknown, applications: ApplicationSummarySource[]) {
  if (applications.length === 0) {
    return {
      cv_id: cvId,
      total: 0,
      average_score: 0,
      highest_score: 0,
      best_match_id: null,
      status_breakdown: {},
      confidence_breakdown: {},
      applications: [],
    };
  }

  // Score calculations
  const scores = applications
    .map((a) => a.match?.score)
    .filter((s): s is number => typeof s === 'number');

  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

  const bestMatch = applications.find((a) => a.match?.score === highestScore) ?? null;

  // Breakdowns
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

  // Lightweight summaries
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

  return {
    cv_id: cvId,
    total: applications.length,
    average_score: averageScore,
    highest_score: highestScore,
    best_match_id: bestMatch?._id ?? null,
    status_breakdown: statusBreakdown,
    confidence_breakdown: confidenceBreakdown,
    applications: summaries,
  };
}
