import { useState } from 'react';

import { useCreateApplication } from '../../api';
import { useCVState } from '../cv/useCVState';
import { useJobState } from '../job/useJobState';

import type { Application } from '@applera/schemas';

export function useHomeState() {
  const cv = useCVState();
  const job = useJobState();

  const [result, setResult] = useState<Application | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const { mutate, isPending, error } = useCreateApplication();

  function handleGenerate() {
    if (!cv.cvId || !job.jobId) {
      return;
    }

    mutate({ cvId: cv.cvId, jobId: job.jobId }, { onSuccess: setResult });
  }

  function handleReset() {
    setResult(null);
    cv.handleReset();
    job.clearJobId();
    setResetKey((k) => k + 1);
  }

  return {
    ...cv,
    ...job,

    result,
    isPending,
    error,

    handleGenerate,
    handleReset,
    canGenerate: !isPending && !!cv.cvId && !!job.jobId,
    resetKey,
  };
}
