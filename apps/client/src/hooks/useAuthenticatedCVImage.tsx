import { useEffect, useState } from 'react';

import { useAuth } from '@clerk/clerk-react';

import { getCVPreview } from '@/api/cv/cv.api';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export function useAuthenticatedCVImage(url: string | null) {
  const { getToken } = useAuth();
  const [src, setSrc] = useState<string | null>(null);

  const fullUrl = url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;

  useEffect(() => {
    setSrc(null);
    if (!fullUrl) {
      return;
    }

    let objectUrl: string | null = null;
    let isMounted = true;

    (async () => {
      try {
        const token = await getToken();
        const res = await getCVPreview(fullUrl, token);
        objectUrl = URL.createObjectURL(res);

        if (!isMounted) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setSrc(objectUrl);
      } catch {
        if (isMounted) {
          setSrc(null);
        }
      }
    })();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fullUrl, getToken]);

  return src;
}
