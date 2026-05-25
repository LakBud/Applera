// =======================================================
// PUBLIC API SURFACE (frontend SDK)
// =======================================================

// ── Hooks ───────────────────────────────────────────────

export { useUploadCVFile, useUploadCVText, useCVs, useCV, useDeleteCV, useCVDashboard } from "./hooks/useCV";

export { useJobs, useJob, useAnalyzeJobFile, useAnalyzeJobText, useDeleteJob } from "./hooks/useJob";

export { useApplicationsByCv, useApplication, useUpdateApplicationStatus, useCreateApplication } from "./hooks/useApplication";

export { useInterviewPrep, useGenerateInterviewPrep } from "./hooks/useInterviewPrep";

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
