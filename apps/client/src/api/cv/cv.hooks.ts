import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '../queryKeys';
import type { ClientError } from '../types';
import { handleMutationError } from '../utils/errors';
import {
  deleteCVById,
  getCVById,
  getCVDashboard,
  getCVs,
  pinCV,
  uploadCVFile,
  uploadCVText,
} from './cv.api';
import { type CVDocument } from './cv.schemas';

export function useCVs(options?: { enabled?: boolean }) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.cv.list(),
    queryFn: () => getCVs(),
    enabled: !!isSignedIn && (options?.enabled ?? true),
  });
}

export function useCV(cvId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.cv.detail(cvId),
    queryFn: () => getCVById(cvId),
    enabled: !!isSignedIn && !!cvId,
  });
}

export function useDeleteCV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cvId: string) => deleteCVById(cvId),
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
    mutationFn: (file: File) => uploadCVFile(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
      toast.success('CV uploaded successfully');
    },
    onError: (error: ClientError) =>
      handleMutationError(error, 'Failed to upload CV. Please try again.'),
  });
}

export function useUploadCVText() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cvText: string) => uploadCVText(cvText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cv.all });
      toast.success('CV saved successfully');
    },
    onError: (error: ClientError) =>
      handleMutationError(error, 'Failed to save CV. Please try again.'),
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

export function useCVDashboard(cvId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.dashboard.byCv(cvId),
    queryFn: () => getCVDashboard(cvId),
    enabled: !!isSignedIn && !!cvId,
  });
}
