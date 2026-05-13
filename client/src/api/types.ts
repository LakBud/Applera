// Single source of truth for all API request/response types.
// Mirrors backend shape (but tolerant to LLM variability)

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}

// ── CV ────────────────────────────────────────────────────────────────────────

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
}

export interface CVDocument {
  _id: string;
  rawText: string;
  parsed: CVParsed;
  createdAt?: string;
  updatedAt?: string;
}

// ── Job ───────────────────────────────────────────────────────────────────────

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
  company?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyzeJobResponse {
  message: string;
  rawText: string;
  structured: JobParsed;
}

// ── Match ─────────────────────────────────────────────────────────────────────

export interface MatchResult {
  score: number;
  confidence: "high" | "medium" | "low";
  strengths: string[];
  missing_skills: string[];
}

// ── Application ───────────────────────────────────────────────────────────────

export interface ApplicationDocument {
  _id: string;

  cv: string | CVDocument;
  job: string | JobDocument;

  match: MatchResult;

  tailored_cv_summary: string;
  cover_letter: string;

  application_email: {
    subject: string;
    body: string;
  };

  status?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApplicationRequest {
  cvText: string;
  jobText: string;
}

export interface CreateApplicationResponse {
  application: ApplicationDocument;
  cv: CVDocument;
  job: JobDocument;
}

// ── InterviewPrep ───────────────────────────────────────────────────────

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
