import { useEffect } from 'react';

import { useAuth } from '@clerk/react';
import { Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import axios from 'axios';

import Nav from '../common/nav/Nav';
import { Toaster } from '../ui/sonner';

export function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  const { pathname } = useLocation();

  const hideNav = pathname.startsWith('/auth');

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${import.meta.env.VITE_API_URL}/health`, {
        signal: controller.signal,
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      {!hideNav && <Nav isSignedIn={!!isSignedIn} isLoaded={isLoaded} />}
      <main className={hideNav ? '' : 'pt-14'}>
        <Outlet />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex items-center gap-3 bg-white border border-green-100 text-green-900 text-sm font-sans px-4 py-3 rounded-md shadow-md w-full',
            success: 'border-green-200 [&>[data-icon]]:text-green-600',
            error: 'border-red-200 text-red-800 [&>[data-icon]]:text-red-500',
            title: 'font-medium',
            description: 'text-xs opacity-70',
          },
        }}
      />
    </div>
  );
}
