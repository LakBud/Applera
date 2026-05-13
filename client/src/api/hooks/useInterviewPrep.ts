import { useQuery } from "@tanstack/react-query";
import { getInterviewPrep } from "../interviewPrep.api";
import { queryKeys } from "../querykeys";

export function useInterviewPrep(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.prep(applicationId),
    queryFn: () => getInterviewPrep(applicationId),
    enabled: !!applicationId,
    staleTime: Infinity, // generated once → basically immutable
  });
}
