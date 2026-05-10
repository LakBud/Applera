import { client } from "./client";
import type { UploadCVResponse } from "./types";

export async function uploadCVFile(file: File): Promise<UploadCVResponse> {
  const form = new FormData();
  form.append("cv", file);

  const response = await client.post<UploadCVResponse>("/api/cv/upload", form, {
    // do NOT set Content-Type manually for multipart — axios must set
    // it itself so it can append the boundary parameter the server needs to
    // split the file parts. Setting it manually breaks the upload silently.
    headers: { "Content-Type": undefined },
  });
  return response.data;
}

export async function uploadCVText(cvText: string): Promise<UploadCVResponse> {
  const response = await client.post<UploadCVResponse>("/api/cv/upload", { cvText });
  return response.data;
}
