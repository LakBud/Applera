import { StrictMode } from 'react';

import { ClerkProvider } from '@clerk/react';
import { QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/geist';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';

import './globals.css';
import { App } from './core/App';
import { queryClient } from './core/queryClient';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterMultiSessionSingleSignOutUrl="/"
      signUpUrl="/auth/sign-up/"
      signInUrl="/auth/sign-in/"
    >
      <QueryClientProvider client={queryClient}>
        <App queryClient={queryClient} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
