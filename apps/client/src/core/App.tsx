import { useAuth } from '@clerk/clerk-react';
import { RouterProvider } from '@tanstack/react-router';

import { router } from './router';

import type { QueryClient } from '@tanstack/react-query';

export function App({ queryClient }: { queryClient: QueryClient }) {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
