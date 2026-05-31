import { useState } from "react";
import type { CreateApplicationResponse } from "../api/schemas";
import { useAnalyzeJobFile, useAnalyzeJobText, useCreateApplication, useUploadCVFile, useUploadCVText } from "../api";

export function useHomeState() {
  const [cvId, setCvId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<CreateApplicationResponse | null>(null);

  const uploadCVFile = useUploadCVFile();
  const uploadCVText = useUploadCVText();
  const uploadJobFile = useAnalyzeJobFile();
  const uploadJobText = useAnalyzeJobText();

  const { mutate, isPending, error } = useCreateApplication();

  function handleGenerate() {
    if (!cvId || !jobId) return;
    mutate({ cvId, jobId }, { onSuccess: (data) => setResult(data) });
  }

  function handleReset() {
    setResult(null);
    setCvId(null);
    setJobId(null);
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
  };
}
