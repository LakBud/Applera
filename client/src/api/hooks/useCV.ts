import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { queryKeys } from '../queryKeys';
import { client } from '../client';
import {
  CVDocumentSchema,
  DashboardSchema,
  UploadCVResponseSchema,
  type CVDocument,
} from '../schemas';
import { pinCV } from '../cv.api';
import { useAuth } from '@clerk/clerk-react';

export function useCVs(options?: { enabled?: boolean }) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.cv.list(),
    queryFn: async () => {
      const res = await client.get('/api/cv');
      return z.array(CVDocumentSchema).parse(res.data);
    },
    enabled: !!isSignedIn && (options?.enabled ?? true),
  });
}

export function useCV(cvId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.cv.detail(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/cv/${cvId}`);
      return CVDocumentSchema.parse(res.data);
    },
    enabled: !!isSignedIn && !!cvId,
  });
}

export function useDeleteCV() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      const res = await client.delete(`/api/cv/${cvId}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
      toast.success('CV deleted');
    },
    onError: () => {
      toast.error('Failed to delete CV. Please try again.');
    },
  });
}

export function useUploadCVFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('cv', file);
      const res = await client.post('/api/cv', form);
      return UploadCVResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
      toast.success('CV uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload CV. Please try again.');
    },
  });
}

export function useUploadCVText() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cvText: string) => {
      const res = await client.post('/api/cv', { cvText });
      return UploadCVResponseSchema.parse(res.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
      toast.success('CV saved successfully');
    },
    onError: () => {
      toast.error('Failed to save CV. Please try again.');
    },
  });
}

export function useCVDashboard(cvId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard.byCv(cvId),
    queryFn: async () => {
      const res = await client.get(`/api/dashboard/${cvId}`);
      return DashboardSchema.parse(res.data);
    },
    enabled: !!isSignedIn && !!cvId,
  });
}

export function usePinCV() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pinCV(id),
    onSuccess: (_, id) => {
      qc.setQueryData(queryKeys.cv.list(), (old: CVDocument[] | undefined) => {
        if (!old) return old;
        return old.map((cv) => (cv._id === id ? { ...cv, pinned: !cv.pinned } : cv));
      });
    },
    onError: () => {
      toast.error('Failed to update pin. Please try again.');
    },
  });
}
