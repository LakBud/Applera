import { JobSchemaData } from "../../types/schema.js";
import { dedupe, normalizeArray, normalizeString } from "../../utils/repair.utils.js";

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
