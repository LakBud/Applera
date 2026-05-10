// Import everything from here — never directly from individual files.
//
// YES - import { useCreateApplication, useUploadCVFile } from "@/api"
// NO - import { useCreateApplication } from "@/api/hooks/useApplication"

// Hooks
export { useCreateApplication } from "./hooks/useApplication";
export { useUploadCVFile, useUploadCVText } from "./hooks/useCV";
export { useAnalyzeJobFile, useAnalyzeJobText } from "./hooks/useJob";

// Raw functions (use hooks in components — these are for non-component contexts)
export { createApplication } from "./application.api";
export { uploadCVFile, uploadCVText } from "./cv.api";
export { analyzeJobFile, analyzeJobText } from "./job.api";

// Types
export type {
  ApiError,
  CVParsed,
  CVDocument,
  UploadCVResponse,
  JobParsed,
  JobDocument,
  AnalyzeJobResponse,
  MatchResult,
  ApplicationDocument,
  CreateApplicationRequest,
  CreateApplicationResponse,
} from "./types";
