import { useAuth } from '@clerk/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '../queryKeys';
import { handleMutationError } from '../utils/errors';
import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  getApplicationsByCv,
  updateApplicationStatus,
} from './application.api';

import type { ClientError } from '../types';
import type { ApplicationStatus } from '@applera/schemas';

export function useApplications() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.application.all,
    queryFn: () => getApplications(),
    enabled: !!isSignedIn,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { cvId: string; jobId: string }) => createApplication(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      toast.success('Application created');
    },
    onError: (error: ClientError) =>
      handleMutationError(error, 'Failed to create application. Please try again later.'),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      qc.removeQueries({ queryKey: queryKeys.application.detail(id) });
      toast.success('Application deleted');
    },
    onError: () => {
      toast.error('Failed to delete application. Please try again.');
    },
  });
}

export function useApplication(id: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.application.detail(id),
    queryFn: () => getApplication(id),
    enabled: !!isSignedIn && !!id,
  });
}

export function useApplicationsByCv(cvId: string) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.application.byCv(cvId),
    queryFn: () => getApplicationsByCv(cvId),
    enabled: !!isSignedIn && !!cvId,
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ApplicationStatus;
      notes?: string;
    }) =>
      updateApplicationStatus(id, {
        status,
        notes,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.application.detail(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.application.all });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status. Please try again.');
    },
  });
}
