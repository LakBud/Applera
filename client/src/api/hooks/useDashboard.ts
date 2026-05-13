import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../dashboard.api";
import { queryKeys } from "../querykeys";

export function useDashboard(cvId: string) {
  return useQuery({
    queryKey: queryKeys.dashboard(cvId),
    queryFn: () => getDashboard(cvId),
    enabled: !!cvId,
    staleTime: 60_000,
  });
}
