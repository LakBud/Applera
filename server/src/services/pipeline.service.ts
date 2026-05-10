import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData, extractJobData } from "./extractors.service.js";
import { matchCVToJob } from "./matches.service.js";
import { generateApplication } from "./application.service.js";

import type { CVData, JobData } from "../types/extractors.schema.js";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Input = Buffer | string;

type MatchResult = Awaited<ReturnType<typeof matchCVToJob>>;
type ApplicationResult = Awaited<ReturnType<typeof generateApplication>>;

type PipelineResult = {
  cv: CVData;
  job: JobData;
  match: MatchResult;
  application: ApplicationResult;
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function isBuffer(value: unknown): value is Buffer {
  return Buffer.isBuffer(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function toText(input: Input, label: string): Promise<string> {
  if (isBuffer(input)) {
    console.info(`[pipeline] Extracting text from ${label} PDF...`);

    return extractTextFromPdf(input);
  }

  if (isString(input)) {
    return input.trim();
  }

  throw new TypeError(`[pipeline] "${label}" must be a non-empty string or PDF Buffer`);
}

// ─────────────────────────────────────────────────────────────
// Main pipeline
// ─────────────────────────────────────────────────────────────

/**
 * End-to-end job application pipeline.
 */
export async function runApplicationPipeline(cvInput: Input, jobInput: Input): Promise<PipelineResult> {
  // Step 1: raw text extraction
  const [cvText, jobText] = await Promise.all([toText(cvInput, "cv"), toText(jobInput, "job")]);

  // Step 2: structured extraction
  console.info("[pipeline] Extracting structured CV and job data...");

  const [cv, job] = await Promise.all([extractCVData(cvText), extractJobData(jobText)]);

  // Step 3: match scoring
  console.info("[pipeline] Computing CV-to-job match...");

  const match = await matchCVToJob(cv, job);

  // Step 4: application generation
  console.info("[pipeline] Generating application...");

  const application = await generateApplication(cv, job, match);

  console.info(`[pipeline] Done. Match score: ${match.score}`);

  return {
    cv,
    job,
    match,
    application,
  };
}
