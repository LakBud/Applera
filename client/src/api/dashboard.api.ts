import type { z } from "zod";
import { client } from "./client";
import { DashboardSchema } from "./schemas";

export type DashboardResponse = z.infer<typeof DashboardSchema>;

// ── GET dashboard for CV ────────────────────────────────────────
export async function getDashboard(cvId: string) {
  const res = await client.get<DashboardResponse>(`/api/dashboard/${cvId}`);

  return DashboardSchema.parse(res.data);
}
