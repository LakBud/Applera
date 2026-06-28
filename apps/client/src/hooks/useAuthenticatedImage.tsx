import { useEffect, useState } from 'react';

import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export function useAuthenticatedImage(url: string | null) {
  const { getToken } = useAuth();
  const [src, setSrc] = useState<string | null>(null);

  const fullUrl = url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;

  useEffect(() => {
    if (!fullUrl) {
      return;
    }

    let objectUrl: string;
    let isMounted = true;

    (async () => {
      const token = await getToken();
      const res = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      objectUrl = URL.createObjectURL(res.data);
      if (isMounted) {
        setSrc(objectUrl);
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
