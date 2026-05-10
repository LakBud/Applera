// ─────────────────────────────────────────────────────────────────────────────
// THE ENTRY POINT for the whole application generation flow.
//
// Accepts:
//   - cvInput:  Buffer (PDF) or string (plain text)
//   - jobInput: Buffer (PDF) or string (plain text)
//
// Returns:
//   { cv, job, match, application }
//
// Each step is logged so progress is visible server-side during long runs.
// ─────────────────────────────────────────────────────────────────────────────

import { extractTextFromPdf } from "../lib/pdfParser.js";
import { extractCVData, extractJobData } from "./extractors.service.js";
import { matchCVToJob } from "./matches.service.js";
import { generateApplication } from "./application.service.js";

// ── Types ─────────────────────────────────────────────────────────────────────

type Input = Buffer | string;

type PipelineResult = {
  cv: Record<string, unknown>;
  job: Record<string, unknown>;
  match: ReturnType<typeof matchCVToJob>;
  application: Awaited<ReturnType<typeof generateApplication>>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isBuffer(v: unknown): v is Buffer {
  return Buffer.isBuffer(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

async function toText(input: Input, label: string): Promise<string> {
  if (isBuffer(input)) {
    console.info(`[pipeline] Extracting text from ${label} PDF…`);
    return extractTextFromPdf(input);
  }

  if (isString(input)) {
    return input.trim();
  }

  throw new TypeError(`[pipeline] "${label}" must be a non-empty string or a PDF Buffer`);
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

/**
 * End-to-end job application pipeline.
 *
 * @param cvInput   CV as PDF buffer or plain text
 * @param jobInput  Job listing as PDF buffer or plain text
 */
export async function runApplicationPipeline(cvInput: Input, jobInput: Input): Promise<PipelineResult> {
  // ── Step 1: Extract raw text ───────────────────────────────────────────────
  const [cvText, jobText] = await Promise.all([toText(cvInput, "cv"), toText(jobInput, "job")]);

  // ── Step 2: Parse text into structured objects (run in parallel) ───────────
  console.info("[pipeline] Extracting structured CV and job data…");

  const [cv, job] = await Promise.all([extractCVData(cvText), extractJobData(jobText)]);

  // ── Step 3: Score the match ────────────────────────────────────────────────
  console.info("[pipeline] Computing CV-to-job match…");

  const match = matchCVToJob(cv, job);

  // ── Step 4: Generate application ────────────────────────────────────────────
  console.info("[pipeline] Generating application…");

  const application = await generateApplication(cv, job, match);

  console.info(`[pipeline] Done. Match score: ${match.score}`);

  return {
    cv,
    job,
    match,
    application,
  };
}
