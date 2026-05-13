import type { z } from "zod";
import { client } from "./client";
import { UploadCVResponseSchema } from "./schemas";

export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;

export async function uploadCVFile(file: File): Promise<UploadCVResponse> {
  const form = new FormData();
  form.append("cv", file);

  const response = await client.post("/api/cv/upload", form);

  return UploadCVResponseSchema.parse(response.data);
}

export async function uploadCVText(cvText: string): Promise<UploadCVResponse> {
  const response = await client.post("/api/cv/upload", {
    cvText,
  });

  return UploadCVResponseSchema.parse(response.data);
}
