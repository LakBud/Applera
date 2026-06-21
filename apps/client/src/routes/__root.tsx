import { useAuth } from '@clerk/clerk-react';
import { createRootRouteWithContext } from '@tanstack/react-router';

import { GlobalError } from '@/components/common/global/GlobalError';
import { GlobalPending } from '@/components/common/global/GlobalPending';
import { RootLayout } from '@/components/layout/RootLayout';

import { NotFoundPage } from '../pages/NotFound';

import type { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: GlobalPending,
  notFoundComponent: NotFoundPage,
  errorComponent: GlobalError,
  component: RootLayout,
});
