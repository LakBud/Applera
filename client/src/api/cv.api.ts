import { client } from "./client";
import type { UploadCVResponse } from "./types";

/**
 * Uploads a CV as a PDF file (multipart/form-data).
 */
export async function uploadCVFile(file: File): Promise<UploadCVResponse> {
  const form = new FormData();
  form.append("cv", file);

  const response = await client.post<UploadCVResponse>("/api/cv/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

/**
 * Uploads a CV as plain text (JSON body).
 */
export async function uploadCVText(cvText: string): Promise<UploadCVResponse> {
  const response = await client.post<UploadCVResponse>("/api/cv/upload", {
    cvText,
  });
  return response.data;
}
