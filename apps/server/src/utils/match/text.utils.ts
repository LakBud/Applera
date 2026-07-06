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

/**
 * Returns what percentage of job description words also appear in the CV text.
 * Score range: 0–100.
 */
const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'you',
  'are',
  'this',
  'that',
  'we',
  'our',
  'your',
  'will',
  'have',
  'from',
  'work',
]);

export function calculateTextOverlap(cvText: string, jobText: string): number {
  if (!cvText || !jobText) {
    return 0;
  }

  const tokenize = (text: string): string[] =>
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const cvWords = new Set(tokenize(cvText));
  const jobWords = tokenize(jobText);

  if (jobWords.length === 0) {
    return 0;
  }

  const matches = jobWords.filter((w) => cvWords.has(w)).length;

  const raw = matches / jobWords.length;

  return Math.round(Math.min(100, raw * 100)); // small boost for realism
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
