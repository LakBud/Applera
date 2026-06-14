// Single source of truth for all frontend API types
// Mirrors backend contracts

// ─────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────

export interface ApiError {
  error: string;
}

export type Confidence = 'high' | 'medium' | 'low';

export type ApplicationStatus =
  | 'generated'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

// ─────────────────────────────────────────────
// CV
// ─────────────────────────────────────────────

export interface CVParsed {
  name?: string;
  email?: string;
  phone?: string;
  github?: string;
  summary?: string;
  seniority_level?: string;

  skills: string[];

  experience: {
    title?: string;
    company?: string;
    highlights: string[];
  }[];

  education: {
    title?: string;
    school?: string;
  }[];

  projects: {
    name?: string;
    description?: string;
    url?: string;
    tech: string[];
  }[];
}

export interface CVDocument {
  _id: string;
  rawText?: string;
  parsed: CVParsed;

  ownerId?: string;
  ownerType?: string;

  applicationsCount?: number;
  lastUsedAt?: string;

  pdfUrl?: string;
  previewImageUrl?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCVResponse {
  message: string;
  cv: CVDocument;
}

export type GetCVsResponse = CVDocument[];
export type GetCVResponse = CVDocument;

// ─────────────────────────────────────────────
// Job
// ─────────────────────────────────────────────

export interface JobParsed {
  title?: string;
  required_skills: string[];
  responsibilities: string[];
  seniority?: string;
}

export interface JobDocument {
  _id: string;
  rawText: string;
  parsed: JobParsed;

  ownerId?: string;
  ownerType?: string;

  company?: string;
  location?: string;

  createdAt?: string;
  updatedAt?: string;
}

// POST /api/job
export interface CreateJobResponse {
  message: string;
  job: JobDocument;
}

// GET /api/job
export type GetJobsResponse = JobDocument[];

// GET /api/job/:id
export type GetJobResponse = JobDocument;

// POST /api/job/analyze
export interface AnalyzeJobResponse {
  rawText: string;
  parsed: JobParsed;
}

// ─────────────────────────────────────────────
// Match
// ─────────────────────────────────────────────

export interface MatchResult {
  score: number;
  confidence: Confidence;

  strengths: string[];
  missing_skills: string[];
}

// ─────────────────────────────────────────────
// Application
// ─────────────────────────────────────────────

export interface ApplicationEmail {
  subject: string;
  body: string;
}

export interface ApplicationDocument {
  _id: string;

  cv: string | CVDocument;
  job: string | JobDocument;

  match: MatchResult;

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: ApplicationEmail;

  status: ApplicationStatus;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}

// POST /api/application
export interface CreateApplicationRequest {
  cvId: string;
  jobId: string;
}

export interface CreateApplicationResponse {
  application: ApplicationDocument;
}

// GET /api/application
export interface GetApplicationsResponse {
  applications: ApplicationDocument[];
}

// GET /api/application/:id
export interface GetApplicationResponse {
  application: ApplicationDocument;
}

// PATCH /api/application/:id/status
export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  notes?: string;
}

// ─────────────────────────────────────────────
// Interview Prep
// ─────────────────────────────────────────────

export interface InterviewQuestion {
  category: string;
  question: string;
  tip: string;
}

export interface InterviewPrep {
  _id: string;
  application: string;

  questions: InterviewQuestion[];
  general_tips: string[];

  createdAt: string;
  updatedAt: string;
}

export interface GenerateInterviewPrepResponse {
  prep: InterviewPrep;
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export interface DashboardApplicationSummary {
  _id: string;
  job_title: string;

  score: number;
  confidence: Confidence;

  status: ApplicationStatus;
  createdAt: string;
}

export interface DashboardResponse {
  cv_id: string;

  total: number;
  average_score: number;
  highest_score: number;

  best_match_id: string | null;

  status_breakdown: Record<string, number>;
  confidence_breakdown: Record<string, number>;

  applications: DashboardApplicationSummary[];
}
