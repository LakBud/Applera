import { client } from "./client";
import type { CreateApplicationRequest, CreateApplicationResponse } from "./types";

/**
 * Parses CV + job text, computes match, and generates a tailored application.
 * This is the main end-to-end call — expect ~10–20s response time.
 */
export async function createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
  const response = await client.post<CreateApplicationResponse>("/api/application/create", data);
  return response.data;
}
