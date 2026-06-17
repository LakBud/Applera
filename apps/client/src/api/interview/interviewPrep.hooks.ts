import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '../queryKeys';
import type { ClientError } from '../types';
import { handleMutationError, isClientError } from '../utils/errors';
import { generateInterviewPrep, getInterviewPrep } from './interviewPrep.api';

export function useInterviewPrep(applicationId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.interviewPrep.byApplication(applicationId),
    queryFn: async () => {
      try {
        return await getInterviewPrep(applicationId);
      } catch (error: unknown) {
        if (isClientError(error) && error.code === 'NOT_FOUND') {
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
    mutationFn: (applicationId: string) => generateInterviewPrep(applicationId),
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
