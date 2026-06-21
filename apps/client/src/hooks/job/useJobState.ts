import { useState } from 'react';

import { useAnalyzeJobFile, useAnalyzeJobText } from '@/api';

export function useJobState() {
  const [jobId, setJobId] = useState<string | null>(null);

  const uploadJobFile = useAnalyzeJobFile();
  const uploadJobText = useAnalyzeJobText();

  function clearJobId() {
    setJobId(null);
  }

  return {
    jobId,
    setJobId,
    clearJobId,
    uploadJobFile,
    uploadJobText,
  };
}
