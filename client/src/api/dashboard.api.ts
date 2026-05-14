import { client } from "./client";
import { DashboardSchema, type DashboardResponse } from "./schemas";

// ── GET dashboard for CV ────────────────────────────────────────
export async function getDashboard(cvId: string): Promise<DashboardResponse> {
  const res = await client.get<unknown>(`/api/dashboard/${cvId}`);

  return DashboardSchema.parse(res.data);
}
