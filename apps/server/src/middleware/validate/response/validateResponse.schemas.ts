import {
  ApplicationResponseSchema,
  ApplicationListResponseSchema,
  ApplicationSchema,
  CVListResponseSchema,
  CVDocumentSchema,
  UploadCVResponseSchema,
  DashboardCVSchema,
  InterviewPrepResponseSchema,
  InterviewPrepSchema,
  CreateJobResponseSchema,
  JobListResponseSchema,
  JobDocumentSchema,
  MessageResponseSchema,
  PinCVResponseSchema,
} from '@applera/schemas';

export const responseSchemas = {
  // application
  applicationResponse: ApplicationResponseSchema,
  applicationListResponse: ApplicationListResponseSchema,
  applicationDocument: ApplicationSchema,

  // cv
  cvListResponse: CVListResponseSchema,
  cvDocument: CVDocumentSchema,
  uploadCVResponse: UploadCVResponseSchema,
  pinCVResponse: PinCVResponseSchema,
  dashboardCV: DashboardCVSchema,

  // interview
  interviewPrepResponse: InterviewPrepResponseSchema,
  interviewPrepDocument: InterviewPrepSchema,

  // job
  createJobResponse: CreateJobResponseSchema,
  jobListResponse: JobListResponseSchema,
  jobDocument: JobDocumentSchema,

  // shared
  messageResponse: MessageResponseSchema,
} as const;

export type responseSchemaName = keyof typeof responseSchemas;
