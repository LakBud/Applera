// =======================================================
// PUBLIC API SURFACE (frontend SDK)
// =======================================================

// ── Hooks ───────────────────────────────────────────────
export { useCreateApplication } from "./hooks/useApplication";

export { useUploadCVFile, useUploadCVText, useCVs } from "./hooks/useCV";

export { useAnalyzeJobFile, useAnalyzeJobText } from "./hooks/useJob";

export { useTracker, useUpdateApplicationStatus } from "./hooks/useTracker";

export { useInterviewPrep } from "./hooks/useInterviewPrep";

export { useDashboard } from "./hooks/useDashboard";

// ── Domain APIs (optional but clean) ────────────────────
export * as applicationApi from "./application.api";
export * as cvApi from "./cv.api";
export * as jobApi from "./job.api";
export * as trackerApi from "./tracker.api";
export * as dashboardApi from "./dashboard.api";
export * as interviewPrepApi from "./interviewPrep.api";

// ── Types ───────────────────────────────────────────────
export type {
  ApiError,
  CVParsed,
  CVDocument,
  JobParsed,
  JobDocument,
  AnalyzeJobResponse,
  MatchResult,
  ApplicationDocument,
  CreateApplicationRequest,
  CreateApplicationResponse,
} from "./types";
