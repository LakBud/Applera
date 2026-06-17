import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { client } from '../client';
import { queryKeys } from '../queryKeys';
import type { ClientError } from '../types';
import { handleMutationError } from '../utils/errors';
import { InterviewPrepSchema } from './interviewPrep.schemas';

export function useInterviewPrep(applicationId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.interviewPrep.byApplication(applicationId),
    queryFn: async () => {
      try {
        const res = await client.get(`/api/interview/${applicationId}`);
        return InterviewPrepSchema.parse(res.data.prep);
      } catch (error: unknown) {
        if ((error as ClientError).code === 'NOT_FOUND') {
          return null;
        }
        throw error;
      }
    },
    enabled: !!isSignedIn && !!applicationId,
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
    onError: (error: ClientError) => {
      if (error.code === 'RATE_LIMITED') {
        toast.error('Maximum regenerations reached', {
          description: "You've reached the maximum of 3 regenerations for this application.",
        });
        return;
      }
      handleMutationError(error, 'Failed to generate interview prep. Please try again.');
    },
  });
}
