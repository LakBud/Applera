import type { Application } from '@/api/application/application.schemas';

import { useState } from 'react';

import {
  useAnalyzeJobFile,
  useAnalyzeJobText,
  useCreateApplication,
  useUploadCVFile,
  useUploadCVText,
} from '../api';

export function useHomeState() {
  const [cvId, setCvId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<Application | null>(null);

  const uploadCVFile = useUploadCVFile();
  const uploadCVText = useUploadCVText();
  const uploadJobFile = useAnalyzeJobFile();
  const uploadJobText = useAnalyzeJobText();

  const { mutate, isPending, error } = useCreateApplication();
  const [resetKey, setResetKey] = useState(0);

  function handleGenerate() {
    if (!cvId || !jobId) return;
    mutate(
      { cvId, jobId },
      {
        onSuccess: (data) => {
          setResult(data);
        },
      },
    );
  }

  function handleReset() {
    setResult(null);
    setCvId(null);
    setJobId(null);
    setResetKey((k) => k + 1);
  }

  function clearCvId() {
    setCvId(null);
  }

  function clearJobId() {
    setJobId(null);
  }

  const canGenerate = !isPending && !!cvId && !!jobId;

  return {
    cvId,
    jobId,
    result,
    isPending,
    error,
    uploadCVFile,
    uploadCVText,
    uploadJobFile,
    uploadJobText,
    setCvId,
    setJobId,
    clearCvId,
    clearJobId,
    handleGenerate,
    handleReset,
    canGenerate,
    resetKey,
  };
}
