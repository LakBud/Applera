import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { client } from '../client';
import { CreateJobResponseSchema, JobDocumentSchema } from '../schemas';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';

export function useJobs() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.job.list(),
    queryFn: async () => {
      const res = await client.get('/api/job');
      return z.array(JobDocumentSchema).parse(res.data);
    },
    enabled: !!isSignedIn,
  });
}

export function useJob(jobId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.job.detail(jobId),
    queryFn: async () => {
      const res = await client.get(`/api/job/${jobId}`);
      return JobDocumentSchema.parse(res.data);
    },
    enabled: !!isSignedIn && !!jobId,
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await client.delete(`/api/job/${jobId}`);
      return res.data;
    },
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
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('job', file);

      const res = await client.post('/api/job', form);
      return CreateJobResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
      toast.success('Job analyzed successfully');
    },
    onError: () => {
      toast.error('Failed to analyze job file. Please try again.');
    },
  });
}

export function useAnalyzeJobText() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (jobText: string) => {
      const res = await client.post('/api/job', { jobText });
      return CreateJobResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.job.all });
      toast.success('Job analyzed successfully');
    },
    onError: () => {
      toast.error('Failed to analyze job text. Please try again.');
    },
  });
}
