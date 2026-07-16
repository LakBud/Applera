import { toast } from 'sonner';

import type { ClientError } from '../types';

export const handleMutationError = (error: ClientError, fallback: string) => {
  if (error.code === 'USAGE_LIMIT_REACHED') {
    toast.error(
      error.meta?.limit
        ? `You have reached your limit of ${error.meta.limit} weekly AI response calls.`
        : 'You have reached your usage limit.',
    );
    return;
  }

  toast.error(error.message || fallback);
};

export function isClientError(error: unknown): error is ClientError {
  return typeof error === 'object' && error !== null && 'code' in error;
}
