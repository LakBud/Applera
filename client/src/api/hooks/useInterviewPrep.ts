import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInterviewPrep, generateInterviewPrep } from "../interviewPrep.api";
import { queryKeys } from "../queryKeys";

/* ─────────────────────────────────────────────
   1. QUERY (cached interview prep)
   ───────────────────────────────────────────── */

export function useInterviewPrep(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.interviewPrep(applicationId),
    queryFn: () => getInterviewPrep(applicationId),
    enabled: !!applicationId,
    staleTime: Infinity,
  });
}

/* ─────────────────────────────────────────────
   2. MUTATION (AI generation)
   ───────────────────────────────────────────── */

export function useGenerateInterviewPrep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) => generateInterviewPrep(applicationId),

    onSuccess: (data, applicationId) => {
      // write into cache (SOURCE OF TRUTH)
      queryClient.setQueryData(queryKeys.interviewPrep(applicationId), data);
    },

    onSettled: (_data, _error, applicationId) => {
      // ensure server consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.interviewPrep(applicationId),
      });
    },
  });
}
