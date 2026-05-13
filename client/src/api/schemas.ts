import { z } from "zod";

// ── Shared ─────────────────────────────

export const MatchSchema = z.object({
  score: z.number(),
  confidence: z.enum(["high", "medium", "low"]),
  strengths: z.array(z.string()),
  missing_skills: z.array(z.string()),
});

// ── CV ─────────────────────────────────

export const CVParsedSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  github: z.string(),
  summary: z.string(),
  seniority_level: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      highlights: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      title: z.string(),
      school: z.string(),
    }),
  ),
});

export const CVDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string(),
  parsed: CVParsedSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UploadCVResponseSchema = z.object({
  message: z.string(),
  rawText: z.string(),
  structured: CVParsedSchema,
});

// ── Job ────────────────────────────────

export const JobParsedSchema = z.object({
  title: z.string(),
  required_skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  seniority: z.string(),
});

export const JobDocumentSchema = z.object({
  _id: z.string(),
  rawText: z.string(),
  parsed: JobParsedSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const AnalyzeJobResponseSchema = z.object({
  message: z.string(),
  rawText: z.string(),
  structured: JobParsedSchema,
});

// ── Application ───────────────────────

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
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── InterviewPrep ───────────────────────

export const InterviewPrepSchema = z.object({
  _id: z.string().optional(),

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

// ── Dashboard ───────────────────────

export const DashboardSchema = z.object({
  total: z.number(),

  average_score: z.number(),

  highest_score: z.number().nullable(),

  best_match_id: z.string().nullable(),

  status_breakdown: z.record(z.string(), z.number()),

  confidence_breakdown: z.record(z.string(), z.number()),

  applications: z.array(
    z.object({
      _id: z.string(),
      job_title: z.string(),
      score: z.number(),
      confidence: z.enum(["high", "medium", "low"]),
      status: z.string(),
      createdAt: z.string(),
    }),
  ),
});
