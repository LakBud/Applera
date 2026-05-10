import { client } from "./client";
import type { AnalyzeJobResponse } from "./types";

/**
 * Analyzes a job listing uploaded as a PDF file.
 */
export async function analyzeJobFile(file: File): Promise<AnalyzeJobResponse> {
  const form = new FormData();
  form.append("job", file);

  const response = await client.post<AnalyzeJobResponse>("/api/job/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Analyzes a job listing provided as plain text.
 */
export async function analyzeJobText(jobText: string): Promise<AnalyzeJobResponse> {
  const response = await client.post<AnalyzeJobResponse>("/api/job/analyze", {
    jobText,
  });
  return response.data;
}
