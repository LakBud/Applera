import { useEffect } from 'react';

import { useAuth } from '@clerk/react';
import { Outlet, useNavigate } from '@tanstack/react-router';

import { Loader } from '../common/Loader';

export function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/auth/sign-up/$' });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return <Loader size="lg" fullScreen text="Loading…" />;
  }
  if (!isSignedIn) {
    return null;
  }

  return <Outlet />;
}
