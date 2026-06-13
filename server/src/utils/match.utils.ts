// Pure utility functions for CV-to-job matching.
// No side effects, no imports — easy to unit test in isolation.
import { MatchReport } from '../types/match.types.js';

/* ── Normalisation ────────────────────────────────────────────────────────── */

/**
 * Normalises a single skill string for comparison.
 * "Node.js" → "nodejs",  "React Native" → "reactnative"
 */
export function normalizeSkill(s: string): string {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[\s.\-_/]+/g, '') // collapse repeats properly
    .replace(/js$/, 'js') // keeps nodejs/reactjs stable
    .replace(/typescript/, 'ts')
    .replace(/javascript/, 'js');
}

/**
 * Normalises an array of skills.
 * Removes duplicates after normalisation.
 * NOTE: normalizeArray was a separate function that duplicated this logic — removed.
 */
export function normalizeSkills(arr: unknown): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return [...new Set(arr.map((s) => normalizeSkill(String(s))).filter(Boolean))];
}

/* ── Skill matching ───────────────────────────────────────────────────────── */

const SKILL_ALIASES: Record<string, string[]> = {
  react: ['reactjs', 'reactnative'],
  nodejs: ['node', 'express'],
  ts: ['typescript'],
  js: ['javascript'],
  aws: ['amazonwebservices'],
  docker: ['containerization'],
};

/**
 * Returns true if two skills refer to the same technology.
 * Guards against single-character false positives (e.g. "C" ⊂ "C++").
 */
export function isSkillMatch(cvSkill: string, jobSkill: string): boolean {
  const a = normalizeSkill(cvSkill);
  const b = normalizeSkill(jobSkill);

  if (!a || !b) {
    return false;
  }
  if (a === b) {
    return true;
  }

  // alias matching (VERY IMPORTANT FIX)
  for (const [key, aliases] of Object.entries(SKILL_ALIASES)) {
    if ((a === key && aliases.includes(b)) || (b === key && aliases.includes(a))) {
      return true;
    }
  }

  // safe substring match (tightened)
  if (a.length >= 4 && b.length >= 4) {
    return a.includes(b) || b.includes(a);
  }

  return false;
}

/* ── Domain mismatch ──────────────────────────────────────────────────────── */

/**
 * Returns true if CV and job skills have very little overlap —
 * suggesting the candidate is applying outside their domain.
 *
 * BUG FIX: original compared raw strings; now normalises before comparing
 * so "React" and "react" are treated as the same skill.
 */
export function detectDomainMismatch(cvSkills: unknown, jobSkills: unknown): boolean {
  const cv = new Set(normalizeSkills(cvSkills));
  const job = normalizeSkills(jobSkills);

  if (job.length < 3) {
    return false;
  }

  const overlap = job.filter((skill) =>
    [...cv].some((cvSkill) => isSkillMatch(cvSkill, skill)),
  ).length;

  const similarity = overlap / job.length;

  return similarity < 0.25;
}

/* ── Text extraction ──────────────────────────────────────────────────────── */

/**
 * Flattens a structured CV or job object into a single plain-text string
 * suitable for word-overlap scoring.
 *
 * FIX: original used JSON.stringify on arrays, which added brackets and quotes
 * as noise words that inflated or deflated match scores incorrectly.
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
    o.summary ?? '',
    flatten(o.skills),
    flatten(o.experience),
    flatten(o.education),
    flatten(o.responsibilities),
    o.raw_description ?? '',
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ── Text overlap score ───────────────────────────────────────────────────── */

/**
 * Returns what percentage of job description words also appear in the CV text.
 * Score range: 0–100.
 *
 * BUG FIX: original was case-sensitive — "React" and "react" didn't match.
 * Now lowercases and filters out short stop-words before comparing.
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

  // FIX: prevent extreme low scores
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

  if (jobSkills.length < 4) {
    confidence -= 10;
  } // less harsh
  if (cvSkills.length < 3) {
    confidence -= 10;
  }
  if (textScore < 15) {
    confidence -= 15;
  }

  if (jobSkills.length > 10) {
    confidence += 5;
  } // richer job desc helps accuracy

  confidence = Math.max(0, Math.min(100, confidence));

  if (confidence >= 70) {
    return 'high';
  }
  if (confidence >= 40) {
    return 'medium';
  }
  return 'low';
}

// ── Seniority ─────────────────────────────────────────────────────────────────

const SENIORITY_RANK: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  principal: 5,
};

function rankSeniority(level: string = ''): number {
  const key = level.toLowerCase().trim();
  return SENIORITY_RANK[key] ?? 2; // default to mid if unknown
}

export function getSeniorityFit(cvLevel: string, jobLevel: string): MatchReport['seniority_fit'] {
  const diff = rankSeniority(cvLevel) - rankSeniority(jobLevel);

  if (diff < 0) {
    return 'under';
  }
  if (diff > 0) {
    return 'over';
  }
  return 'match';
}

// ── Score calculation ─────────────────────────────────────────────────────────

export const SKILL_GRAPH: Record<string, string[]> = {
  react: ['frontend', 'ui', 'web'],
  nextjs: ['react', 'frontend'],
  nodejs: ['backend', 'api'],
  express: ['nodejs', 'backend'],
  typescript: ['javascript'],
  mongodb: ['database', 'nosql'],
  postgresql: ['database', 'sql'],
  aws: ['cloud', 'devops'],
  docker: ['devops', 'deployment'],
};

export function expandSkills(skills: string[]): Set<string> {
  const expanded = new Set<string>();

  for (const raw of skills) {
    const skill = normalizeSkill(raw);
    expanded.add(skill);

    // forward edges
    SKILL_GRAPH[skill]?.forEach((r) => expanded.add(r));

    // reverse edges — if cv has "react", also match "nextjs" jobs
    for (const [parent, children] of Object.entries(SKILL_GRAPH)) {
      if (children.includes(skill)) {
        expanded.add(parent);
      }
    }
  }

  return expanded;
}

export function calculateSemanticSkillScore(cvSkills: string[], jobSkills: string[]): number {
  const cv = expandSkills(cvSkills);
  const job = expandSkills(jobSkills);

  if (job.size === 0) {
    return 0;
  }

  let matches = 0;

  for (const skill of job) {
    if (cv.has(skill)) {
      matches++;
    }
  }

  const score = matches / job.size;

  return Math.round(score * 100);
}

const SKILL_WEIGHTS: Record<string, number> = {
  backend: 1.2,
  frontend: 1.2,
  api: 1.1,
  database: 1.1,
  devops: 1.0,
  cloud: 1.0,
};

export function weightedSkillScore(cvSkills: string[], jobSkills: string[]): number {
  const cvExpanded = expandSkills(cvSkills);

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const skill of jobSkills) {
    // original job skills only
    const normalized = normalizeSkill(skill);
    const weight = SKILL_WEIGHTS[normalized] ?? 1;
    totalWeight += weight;
    if (cvExpanded.has(normalized)) {
      matchedWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return 0;
  }
  return Math.round((matchedWeight / totalWeight) * 100);
}

// Weighted blend:
//   60% — skill overlap   (most important signal)
//   40% — text overlap    (catches experience, domain language, responsibilities)

export function calculateScore(cvSkills: string[], jobSkills: string[], textScore: number): number {
  const skillScore = weightedSkillScore(cvSkills, jobSkills);
  const raw = skillScore * 0.65 + textScore * 0.35;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

// ── Runtime guard (safe object check) ─────────────────────────────────────────

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/* ── Recommendation ───────────────────────────────────────────────────────── */

/**
 * Returns a human-readable recommendation string based on the match score.
 */
export function generateRecommendation(score: number): string {
  if (score >= 80) {
    return 'Strong match — apply immediately';
  }
  if (score >= 60) {
    return 'Good match — consider applying';
  }
  if (score >= 40) {
    return 'Moderate match — improve CV first';
  }
  return 'Weak match — not recommended';
}
