import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Loader } from '../../components/common/Loader';

export const Route = createFileRoute('/__protected')({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/auth/sign-up/$' });
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return <Loader size="lg" fullScreen text="Loading…" />;
  if (!isSignedIn) return null;

  return <Outlet />;
}
