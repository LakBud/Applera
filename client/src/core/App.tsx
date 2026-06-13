import { useAuth } from '@clerk/clerk-react';
import type { QueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { router } from './router';

export function App({ queryClient }: { queryClient: QueryClient }) {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
