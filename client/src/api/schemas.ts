import { z } from "zod";

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);

export const ApplicationStatusSchema = z.enum(["generated", "applied", "interviewing", "offered", "rejected", "withdrawn"]);

export const MatchSchema = z.object({
  score: z.number(),
  confidence: ConfidenceSchema,
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

// ─────────────────────────────────────────────
// CV
// ─────────────────────────────────────────────

export const CVParsedSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
  seniority_level: z.string().optional(),

  skills: z.array(z.string()),

  experience: z.array(
    z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      highlights: z.array(z.string()),
    }),
  ),

  education: z.array(
    z.object({
      title: z.string().optional(),
      school: z.string().optional(),
    }),
  ),
});

export const CVDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string(),
  parsed: CVParsedSchema,

  applicationsCount: z.number().optional(),
  lastUsedAt: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const UploadCVResponseSchema = z.object({
  message: z.string(),
  cv: CVDocumentSchema,
});

// ─────────────────────────────────────────────
// Job
// ─────────────────────────────────────────────

export const JobParsedSchema = z.object({
  title: z.string().optional(),
  required_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  seniority: z.string().optional(),
});

export const JobDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string(),
  parsed: JobParsedSchema,

  company: z.string().optional(),
  location: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateJobResponseSchema = z.object({
  message: z.string(),
  job: JobDocumentSchema,
});

// ─────────────────────────────────────────────
// Application
// ─────────────────────────────────────────────

export const ApplicationSchema = z.object({
  _id: z.string(),

  cv: z.union([z.string(), CVDocumentSchema]),
  job: z.union([z.string(), JobDocumentSchema]),

  match: MatchSchema,

  tailored_cv_summary: z.string(),
  cover_letter: z.string(),

  application_email: z.object({
    subject: z.string(),
    body: z.string(),
  }),

  status: ApplicationStatusSchema,
  notes: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateApplicationRequestSchema = z.object({
  cvId: z.string(),
  jobId: z.string(),
});

export const CreateApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export const GetApplicationsResponseSchema = z.object({
  applications: z.array(ApplicationSchema),
});

export const GetApplicationResponseSchema = z.object({
  application: ApplicationSchema,
});

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
  notes: z.string().optional(),
});

// ─────────────────────────────────────────────
// Interview Prep
// ─────────────────────────────────────────────

export const InterviewPrepSchema = z.object({
  _id: z.string(),

  application: z.string(),

  questions: z.array(
    z.object({
      category: z.string(),
      question: z.string(),
      tip: z.string(),
    }),
  ),

  general_tips: z.array(z.string()),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const GenerateInterviewPrepResponseSchema = z.object({
  prep: InterviewPrepSchema,
});

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export const DashboardSchema = z.object({
  cv_id: z.string(),

  total: z.number(),
  average_score: z.number(),
  highest_score: z.number(),

  best_match_id: z.string().nullable(),

  status_breakdown: z.record(z.string(), z.number()),
  confidence_breakdown: z.record(z.string(), z.number()),

  applications: z.array(
    z.object({
      _id: z.string(),
      job_title: z.string(),
      score: z.number(),
      confidence: ConfidenceSchema,
      status: ApplicationStatusSchema,
      createdAt: z.string(),
    }),
  ),
});

// inferred TS types
export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;
export type CVDocument = z.infer<typeof CVDocumentSchema>;

export type JobDocument = z.infer<typeof JobDocumentSchema>;
export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>;

export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;

export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusSchema>;

export type Dashboard = z.infer<typeof DashboardSchema>;
export type DashboardResponse = z.infer<typeof DashboardSchema>;

export type InterviewPrep = z.infer<typeof InterviewPrepSchema>;

export type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;
