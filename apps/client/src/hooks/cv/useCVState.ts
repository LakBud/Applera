import { useState } from 'react';

import { useUploadCVFile, useUploadCVText } from '@/api';

export function useCVState() {
  const [cvId, setCvId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const uploadCVFile = useUploadCVFile();
  const uploadCVText = useUploadCVText();

  function clearCvId() {
    setCvId(null);
  }

  function handleReset() {
    setCvId(null);
    setResetKey((k) => k + 1);
  }

  return {
    cvId,
    setCvId,
    clearCvId,
    resetKey,
    handleReset,
    uploadCVFile,
    uploadCVText,
  };
}
