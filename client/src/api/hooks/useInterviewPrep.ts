import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '../client';
import { InterviewPrepSchema } from '../schemas';
import { queryKeys } from '../queryKeys';
import { useAuth } from '@clerk/clerk-react';

export function useInterviewPrep(applicationId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.interviewPrep.byApplication(applicationId),
    queryFn: async () => {
      try {
        const res = await client.get(`/api/interview/${applicationId}`);
        return InterviewPrepSchema.parse(res.data.prep);
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!isSignedIn && !!applicationId,
    retry: false,
  });
}

export function useGenerateInterviewPrep() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await client.post(`/api/interview/${applicationId}`);
      return InterviewPrepSchema.parse(res.data.prep);
    },
    onSuccess: (data, applicationId) => {
      qc.setQueryData(queryKeys.interviewPrep.byApplication(applicationId), data);
      toast.success('Interview prep generated');
    },
    onError: (err: any) => {
      if (err?.response?.status === 429) {
        toast.error("You've reached the maximum of 3 regenerations for this application.");
      } else {
        toast.error('Failed to generate interview prep. Please try again.');
      }
    },
  });
}
