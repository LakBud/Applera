import { client } from "./client";
import type { ApplicationDocument } from "./types";

// ── GET all applications for a CV ───────────────────────────────
export async function getApplicationsByCv(cvId: string) {
  const res = await client.get<{ applications: ApplicationDocument[] }>(`/api/tracker/${cvId}`);

  return res.data;
}

// ── GET single application ──────────────────────────────────────
export async function getApplication(id: string) {
  const res = await client.get<{ application: ApplicationDocument }>(`/api/tracker/application/${id}`);

  return res.data;
}

// ── UPDATE application status ───────────────────────────────────
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  const res = await client.patch<{ application: ApplicationDocument }>(`/api/tracker/application/${id}/status`, {
    status,
    notes,
  });

  return res.data;
}
