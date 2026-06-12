import { extractCVData, extractJobData } from './extractors.service.js';
import { matchCVToJob } from './match.service.js';
import { generateApplication } from './application.service.js';
import { normalizeText } from './repair/repairText.service.js';
import { toText } from '../utils/pipeline.utils.js';
import { PipelineResult } from '../types/pipeline.types.js';

export type Input = Buffer | string;

// ─────────────────────────────────────────────────────────────
// Main pipeline
// ─────────────────────────────────────────────────────────────

/**
 * End-to-end job application pipeline.
 */
export async function runApplicationPipeline(
  cvInput: Input,
  jobInput: Input,
): Promise<PipelineResult> {
  // Step 1: raw text extraction
  const [cvTextRaw, jobTextRaw] = await Promise.all([
    toText(cvInput, 'cv'),
    toText(jobInput, 'job'),
  ]);

  // Step 2: structured extraction
  console.info('[pipeline] Extracting structured CV and job data...');

  const cvText = normalizeText(cvTextRaw, { type: 'cv' });
  const jobText = normalizeText(jobTextRaw, { type: 'job' });

  const [cv, job] = await Promise.all([extractCVData(cvText), extractJobData(jobText)]);

  // Step 3: match scoring
  console.info('[pipeline] Computing CV-to-job match...');

  const match = await matchCVToJob(cv, job);

  // Step 4: application generation
  console.info('[pipeline] Generating application...');

  const application = await generateApplication(cv, job, match);
  const applicationLetter = application.application_letter ?? {};

  const normalizedApplication = {
    ...application,
    application_letter: {
      introduction: applicationLetter.introduction ?? '',
      body: applicationLetter.body ?? '',
      closing: applicationLetter.closing ?? '',
    },
  };

  console.info(`[pipeline] Done. Match score: ${match.score}`);

  return {
    cv,
    job,
    match,
    application: normalizedApplication,
  };
}
