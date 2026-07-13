// =======================================================
// PUBLIC API SURFACE
// =======================================================

// ── Hooks ───────────────────────────────────────────────

export {
  useUploadCVFile,
  useUploadCVText,
  useCVs,
  useCV,
  useDeleteCV,
  useCVDashboard,
} from './cv/cv.hooks';

export {
  useJobs,
  useJob,
  useAnalyzeJobFile,
  useAnalyzeJobText,
  useDeleteJob,
} from './job/job.hooks';

export {
  useApplicationById,
  useUpdateApplicationStatus,
  useCreateApplication,
} from './application/application.hook';

export { useInterviewPrep, useGenerateInterviewPrep } from './interview/interviewPrep.hooks';

// ── Domain APIs (optional but clean) ────────────────────
export * as applicationApi from './application/application.api';
export * as cvApi from './cv/cv.api';
export * as jobApi from './job/job.api';
export * as interviewPrepApi from './interview/interviewPrep.api';
