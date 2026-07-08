import { dedupe, normalizeArray, normalizeString } from '../../utils/shared/repair.utils.js';
import { normalizeSeniority } from '../../utils/shared/seniority.utils.js';

import type { CVParsed } from '@applera/schemas';

type Raw = Record<string, unknown>;

function toRaw(value: unknown): Raw {
  return value && typeof value === 'object' ? (value as Raw) : {};
}

function toRawArray(value: unknown): Raw[] {
  return Array.isArray(value) ? value.map(toRaw) : [];
}

// ─────────────────────────────────────────────
// Main Repair Function
// ─────────────────────────────────────────────

export function repairCV(cv: unknown): CVParsed {
  if (!cv || typeof cv !== 'object') {
    throw new TypeError('[cvRepair] CV must be a valid object');
  }

  const data = toRaw(cv);

  return {
    name: normalizeString(data.name),
    email: normalizeString(data.email),
    phone: normalizeString(data.phone),
    github: normalizeString(data.github),
    summary: normalizeString(data.summary),
    seniority_level: normalizeSeniority(data.seniority_level),
    skills: dedupe(normalizeArray(data.skills)),

    experience: toRawArray(data.experience)
      .map((exp) => ({
        title: normalizeString(exp.title),
        company: normalizeString(exp.company),
        highlights: dedupe(normalizeArray(exp.highlights)),
      }))
      .filter((e) => e.title || e.company),

    education: toRawArray(data.education)
      .map((edu) => ({
        title: normalizeString(edu.title),
        school: normalizeString(edu.school),
      }))
      .filter((e) => e.title || e.school),

    projects: toRawArray(data.projects)
      .map((p) => ({
        name: normalizeString(p.name),
        description: normalizeString(p.description),
        url: normalizeString(p.url),
        tech: dedupe(normalizeArray(p.tech)),
      }))
      .filter((p) => p.name || p.description),
  };
}
