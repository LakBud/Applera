import { client } from "./client";
import type { CreateApplicationRequest, CreateApplicationResponse } from "./types";

/**
 * Parses CV + job text, computes match, and generates a tailored application.
 * Expect ~10–30s response time — three LLM calls run sequentially.
 */
export async function createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
  const response = await client.post<CreateApplicationResponse>("/api/application/create", data);
  return response.data;
}
