import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '../queryKeys';
import { handleMutationError } from '../utils/errors';
import { createJobFile, createJobText, deleteJob, getJobById, getJobs } from './job.api';

import type { ClientError } from '../types';

export function useJobs() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.job.list(),
    queryFn: () => getJobs(),
    enabled: !!isSignedIn,
  });
}

export function useJob(jobId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: () => getJobById(jobId),
    enabled: !!isSignedIn && !!jobId,
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
      toast.success('Job deleted');
    },
    onError: () => {
      toast.error('Failed to delete job. Please try again.');
    },
  });
}

export function useAnalyzeJobFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => createJobFile(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
      toast.success('Job analyzed successfully');
    },
    onError: (error: ClientError) =>
      handleMutationError(error, 'Failed to analyze job file. Please try again.'),
  });
}

export function useAnalyzeJobText() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (jobText: string) => createJobText(jobText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
      toast.success('Job analyzed successfully');
    },
    onError: (error: ClientError) =>
      handleMutationError(error, 'Failed to analyze job text. Please try again.'),
  });
}
