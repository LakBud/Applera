import { client } from "./client";
import type { AnalyzeJobResponse } from "./types";

export async function analyzeJobFile(file: File): Promise<AnalyzeJobResponse> {
  const form = new FormData();
  form.append("job", file);

  const response = await client.post<AnalyzeJobResponse>("/api/job/analyze", form, {
    // Let axios set Content-Type with boundary
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

export async function analyzeJobText(jobText: string): Promise<AnalyzeJobResponse> {
  const response = await client.post<AnalyzeJobResponse>("/api/job/analyze", { jobText });
  return response.data;
}
