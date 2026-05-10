import { JobSchemaData } from "../../types/extractors.schema.js";

function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function repairJob(job: JobSchemaData): JobSchemaData {
  if (!job || typeof job !== "object") {
    throw new TypeError("[jobRepair] Job must be a valid object");
  }

  return {
    ...job,
    title: normalizeString(job.title),
    seniority: normalizeString(job.seniority),
    required_skills: dedupe(normalizeArray(job.required_skills)),
    responsibilities: dedupe(normalizeArray(job.responsibilities)),
  };
}
