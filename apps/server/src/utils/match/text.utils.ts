/* ── Text extraction ──────────────────────────────────────────────────────── */

/**
 * Flattens a structured CV or job object into a single plain-text string
 * suitable for word-overlap scoring.
 */
export function extractAllText(obj: unknown): string {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  const flatten = (val: unknown): string => {
    if (!val) {
      return '';
    }
    if (typeof val === 'string') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(flatten).join(' ');
    }
    if (typeof val === 'object') {
      return Object.values(val as Record<string, unknown>)
        .map(flatten)
        .join(' ');
    }
    return String(val);
  };

  const o = obj as Record<string, unknown>;

  return [
    flatten(o.summary),
    flatten(o.skills),
    flatten(o.experience),
    flatten(o.education),
    flatten(o.responsibilities),
    flatten(o.raw_description),
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── Text overlap score ───────────────────────────────────────────────────── */

import { francAll } from 'franc-min';
import * as sw from 'stopword';

/**
 * Set of language codes the `stopword` package actually ships stopword
 * lists for (excludes its non-language exports `removeStopwords` and
 * `default`). Built from the package's real keys so this list stays in
 * sync automatically if `stopword` adds/removes language support.
 *
 * `franc-min` and `stopword` both use ISO 639-3 (3-letter) codes, so
 * `franc-min`'s detected language can be checked against this set directly
 * with no code-format translation needed.
 */
type SupportedLang = Exclude<keyof typeof sw, 'removeStopwords' | 'default'>;

const SUPPORTED_LANGS = new Set(
  Object.keys(sw).filter((k) => k !== 'removeStopwords' && k !== 'default'),
) as Set<SupportedLang>;

/**
 * Detects the language of `text` and returns the matching stopword list
 * from the `stopword` package.
 *
 * Falls back to English (`eng`) when detection fails (e.g. text too short,
 * per `francAll`'s `minLength` option) or when the detected language isn't
 * one `stopword` has a list for.
 */
function detectStopwords(text: string): Set<string> {
  const [topGuess] = francAll(text, { minLength: 10 });
  const code = topGuess?.[0];

  const lang: SupportedLang =
    code && SUPPORTED_LANGS.has(code as SupportedLang) ? (code as SupportedLang) : 'eng';

  return new Set(sw[lang] as string[]);
}

/**
 * Returns what percentage of job description words also appear in the CV
 * text, after stripping common stopwords for the job text's detected
 * language.
 *
 * Language is detected once, from the job text only — CV and job are
 * assumed to share a language, since mixed-language CV/job pairs are an
 * edge case rather than the common path.
 *
 * Score range: 0–100.
 */
export function calculateTextOverlap(cvText: string, jobText: string): number {
  if (!cvText || !jobText) {
    return 0;
  }

  const stopwords = detectStopwords(jobText);

  const tokenize = (text: string): string[] =>
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/gu)
      .filter((w) => w.length > 2 && !stopwords.has(w));

  const cvWords = new Set(tokenize(cvText));
  const jobWords = tokenize(jobText);

  if (jobWords.length === 0) return 0;

  const matches = jobWords.filter((w) => cvWords.has(w)).length;
  return Math.round(Math.min(100, (matches / jobWords.length) * 100));
}

/* ── Confidence level ─────────────────────────────────────────────────────── */

/**
 * Rates how reliable the match score is based on data quality.
 * A low-confidence score means there wasn't enough information to judge well.
 */
export function getConfidenceLevel({
  cvSkills = [],
  jobSkills = [],
  textScore = 0,
}: {
  cvSkills?: string[];
  jobSkills?: string[];
  textScore?: number;
}): 'high' | 'medium' | 'low' {
  let confidence = 100;

  // penalties
  if (jobSkills.length < 4) {
    confidence -= 20;
  }

  if (cvSkills.length < 3) {
    confidence -= 20;
  }

  if (textScore < 15) {
    confidence -= 25;
  }

  if (jobSkills.length > 10) {
    confidence += 5;
  }

  confidence = Math.max(0, Math.min(100, confidence));

  if (confidence >= 75) {
    return 'high';
  }
  if (confidence >= 40) {
    return 'medium';
  }
  return 'low';
}
