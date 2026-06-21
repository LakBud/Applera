import { createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';
import type { QueryClient } from '@tanstack/react-query';

export type RouterContext = {
  queryClient: QueryClient;
};

export const router = createRouter({
  routeTree,
  context: undefined!, // injected at runtime
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
    context: RouterContext;
  }
}
