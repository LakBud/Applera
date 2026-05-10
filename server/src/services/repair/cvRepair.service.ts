/**
 * CV Repair Layer
 *
 * Purpose:
 * Takes raw structured CV data (from LLM extraction)
 * and normalizes it into a consistent, pipeline-safe format.
 *
 * This prevents downstream errors in:
 * - matchCVToJob
 * - generateApplication
 *
 * It does NOT call LLMs.
 * It is pure deterministic cleanup logic.
 */

import { CVSchemaData } from "../../types/extractors.schema.js";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ─────────────────────────────────────────────────────────────
// Main Repair Function
// ─────────────────────────────────────────────────────────────

/**
 * Repairs and normalizes CV data.
 *
 * @param cv Raw CV object from extractCVData (LLM output)
 * @returns Cleaned CV object safe for matching & generation
 */
export function repairCV(cv: CVSchemaData): CVSchemaData {
  if (!cv || typeof cv !== "object") {
    throw new TypeError("[cvRepair] CV must be a valid object");
  }

  const skills = dedupe(normalizeArray((cv as any).skills));

  const experience = Array.isArray((cv as any).experience)
    ? (cv as any).experience.map((exp: any) => ({
        ...exp,
        title: normalizeString(exp?.title),
        company: normalizeString(exp?.company),
        highlights: normalizeArray(exp?.highlights),
      }))
    : [];

  const education = Array.isArray((cv as any).education)
    ? (cv as any).education.map((edu: any) => ({
        ...edu,
        title: normalizeString(edu?.title),
      }))
    : [];

  return {
    ...cv,

    // normalized core fields
    name: normalizeString((cv as any).name),
    summary: normalizeString((cv as any).summary),
    seniority_level: normalizeString((cv as any).seniority_level),

    // cleaned arrays
    skills,
    experience,
    education,
  };
}
