import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ClerkProvider } from '@clerk/clerk-react';
import '@fontsource-variable/geist';
import { QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';

import { App } from './core/App';
import { queryClient } from './core/queryClient';
import './globals.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
        <Analytics />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
