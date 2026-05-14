import type { z } from "zod";
import { client } from "./client";
import { UploadCVResponseSchema } from "./schemas";
import type { CVDocument } from "./types";

export type UploadCVResponse = z.infer<typeof UploadCVResponseSchema>;

export async function uploadCVFile(file: File): Promise<UploadCVResponse> {
  const formData = new FormData();
  formData.append("cv", file);

  const response = await client.post("/api/cv/upload", formData);

  return UploadCVResponseSchema.parse(response.data);
}

export async function uploadCVText(cvText: string): Promise<UploadCVResponse> {
  const response = await client.post("/api/cv/upload", {
    cvText,
  });

  return UploadCVResponseSchema.parse(response.data);
}

export async function getCVs(): Promise<CVDocument[]> {
  const response = await client.get("/api/cv");
  return response.data;
}
