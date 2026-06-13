import { CVSchemaData } from '../../types/schemas/schema.js';
import { dedupe, normalizeArray, normalizeString } from '../../utils/repair.utils.js';

type CVSeniority = 'executive' | 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'unknown';

// ─────────────────────────────────────────────
// Seniority normalization (more robust)
// ─────────────────────────────────────────────

function normalizeSeniority(input: unknown): CVSeniority {
  const v = normalizeString(String(input)).toLowerCase();

  if (!v) {
    return 'unknown';
  }

  if (v.includes('intern')) {
    return 'intern';
  }
  if (v.includes('junior')) {
    return 'junior';
  }
  if (v.includes('lead')) {
    return 'lead';
  }
  if (v.includes('senior')) {
    return 'senior';
  }
  if (v.includes('mid') || v.includes('intermediate')) {
    return 'mid';
  }
  if (v.includes('executive') || v.includes('c-level') || v.includes('cto') || v.includes('ceo')) {
    return 'executive';
  }

  return 'unknown';
}

// ─────────────────────────────────────────────
// Main Repair Function
// ─────────────────────────────────────────────

export function repairCV(cv: unknown): CVSchemaData {
  if (!cv || typeof cv !== 'object') {
    throw new TypeError('[cvRepair] CV must be a valid object');
  }

  const data = cv as any;

  const skills = dedupe(normalizeArray(data.skills));

  const experience = (Array.isArray(data.experience) ? data.experience : [])
    .map((exp: any) => ({
      title: normalizeString(exp?.title),
      company: normalizeString(exp?.company),
      highlights: dedupe(normalizeArray(exp?.highlights)),
    }))
    .filter((e: any) => e.title || e.company);

  const education = (Array.isArray(data.education) ? data.education : [])
    .map((edu: any) => ({
      title: normalizeString(edu?.title),
      school: normalizeString(edu?.school),
    }))
    .filter((e: any) => e.title || e.school);

  return {
    name: normalizeString(data.name),
    email: normalizeString(data.email),
    phone: normalizeString(data.phone),
    github: normalizeString(data.github),
    summary: normalizeString(data.summary),

    seniority_level: normalizeSeniority(data.seniority_level),

    skills,
    experience,
    education,

    projects: Array.isArray(data.projects)
      ? data.projects
          .map((p: any) => ({
            name: normalizeString(p?.name),
            description: normalizeString(p?.description),
            url: normalizeString(p?.url),
            tech: dedupe(normalizeArray(p?.tech)),
          }))
          .filter((p: any) => p.name || p.description)
      : [],
  };
}
