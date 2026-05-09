export function getConfidenceLevel({ cvSkills, jobSkills, textScore }) {
  let confidence = 100;

  // Not enough data
  if (jobSkills.length < 3) confidence -= 20;
  if (cvSkills.length < 3) confidence -= 15;

  // Weak overlap
  if (textScore < 20) confidence -= 20;

  // Clamp
  if (confidence < 0) confidence = 0;
  if (confidence > 100) confidence = 100;

  if (confidence >= 75) return "high";
  if (confidence >= 45) return "medium";
  return "low";
}

/* ---------------- SKILL NORMALIZATION ---------------- */

export function normalizeSkill(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[\s.-]/g, "")
    .trim();
}

/* ---------------- SKILL MATCHING ---------------- */

export function isSkillMatch(cvSkill, jobSkill) {
  const a = normalizeSkill(cvSkill);
  const b = normalizeSkill(jobSkill);

  return a === b || a.includes(b) || b.includes(a);
}

/* ---------------- DOMAIN MISMATCH ---------------- */

export function detectDomainMismatch(cvSkills, jobSkills) {
  const cv = new Set(cvSkills);
  const job = new Set(jobSkills);

  // overlap score (how similar the domains feel)
  let overlap = 0;

  for (const skill of job) {
    if (cv.has(skill)) overlap++;
  }

  const similarity = job.length === 0 ? 1 : overlap / job.length;

  // If almost no overlap → likely domain mismatch
  return similarity < 0.15;
}

/* ---------------- TEXT EXTRACTION ---------------- */

export function extractAllText(obj) {
  return `
${obj?.summary || ""}
${JSON.stringify(obj?.skills || [])}
${JSON.stringify(obj?.experience || [])}
${JSON.stringify(obj?.education || [])}
  `;
}

/* ---------------- TEXT OVERLAP SCORE ---------------- */

export function calculateTextOverlap(cvText, jobText) {
  const cvWords = new Set(cvText.split(/\s+/).filter(Boolean));
  const jobWords = jobText.split(/\s+/).filter(Boolean);

  let matches = 0;

  for (const word of jobWords) {
    if (cvWords.has(word)) matches++;
  }

  return jobWords.length === 0 ? 0 : (matches / jobWords.length) * 100;
}

/* ---------------- RECOMMENDATION LOGIC ---------------- */

export function generateRecommendation(score) {
  if (score >= 80) return "Strong match — apply immediately";
  if (score >= 60) return "Good match — consider applying";
  if (score >= 40) return "Moderate match — improve CV first";
  return "Weak match — not recommended";
}
