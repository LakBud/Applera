import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { client } from "../client";
import { DashboardSchema } from "../schemas";

export function useDashboard(cvId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.byCv(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/dashboard/${cvId}`);
      return DashboardSchema.parse(res.data);
    },
    enabled: !!cvId,
  });
}
