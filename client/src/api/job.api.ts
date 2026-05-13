import type { z } from "zod";
import { client } from "./client";
import { AnalyzeJobResponseSchema, JobParsedSchema } from "./schemas";

export type JobParsed = z.infer<typeof JobParsedSchema>;
export type AnalyzeJobResponse = z.infer<typeof AnalyzeJobResponseSchema>;

export async function analyzeJobFile(file: File): Promise<AnalyzeJobResponse> {
  const form = new FormData();
  form.append("job", file);

  const response = await client.post("/api/job/analyze", form);

  return AnalyzeJobResponseSchema.parse(response.data);
}

export async function analyzeJobText(jobText: string): Promise<AnalyzeJobResponse> {
  const response = await client.post("/api/job/analyze", { jobText });

  return AnalyzeJobResponseSchema.parse(response.data);
}
