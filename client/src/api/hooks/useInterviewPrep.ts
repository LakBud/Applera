import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../client";
import { InterviewPrepSchema } from "../schemas";
import { queryKeys } from "../queryKeys";

export function useInterviewPrep(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.interviewPrep.byApplication(applicationId),
    queryFn: async () => {
      const res = await client.get(`/api/interview/${applicationId}`);
      return InterviewPrepSchema.parse(res.data.prep);
    },
    enabled: !!applicationId,
  });
}

export function useGenerateInterviewPrep() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await client.post(`/api/interview/${applicationId}`);

      return InterviewPrepSchema.parse(res.data.prep);
    },

    onSuccess: (_, applicationId) => {
      qc.invalidateQueries({
        queryKey: queryKeys.interviewPrep.byApplication(applicationId),
      });
    },
  });
}
