/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Clerk: mock "@clerk/clerk-react" per test file rather than wrapping with
// the real ClerkProvider here.
//
// TanStack Router: for *.unit.test.tsx, mock the specific router hooks the
// component calls (useNavigate, useParams). For *.int.test.tsx flows that
// genuinely need real navigation between routes, mount a real router with
// createMemoryHistory instead of mocking hooks individually — see
// src/pages/example.int.test.tsx for the pattern.

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
