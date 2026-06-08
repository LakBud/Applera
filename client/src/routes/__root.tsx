import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import Nav from "../components/common/nav/Nav";
import { Loader2 } from "lucide-react";
import { Toaster } from "../components/ui/sonner";
import { NotFoundPage } from "../pages/NotFound";
import { AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { useEffect } from "react";
import axios from "axios";

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

function GlobalPending() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-green-800" />
    </div>
  );
}

export function GlobalError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-bg text-tx-body px-6">
      <div className="max-w-md w-full border border-border bg-white/70 rounded-xl p-6 shadow-sm text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-lg font-semibold text-tx-h1">Something went wrong</h1>

        <p className="text-sm text-tx-muted wrap-break-words">{message}</p>

        <Button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-md bg-green-800 text-white hover:bg-green-700 transition"
        >
          Reload page
        </Button>
      </div>
    </div>
  );
}

function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

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
      <Nav isSignedIn={!!isSignedIn} isLoaded={isLoaded} />
      <main className="pt-14">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "flex items-center gap-3 bg-white border border-green-100 text-green-900 text-sm font-sans px-4 py-3 rounded-md shadow-md w-full",
            success: "border-green-200 [&>[data-icon]]:text-green-600",
            error: "border-red-200 text-red-800 [&>[data-icon]]:text-red-500",
            title: "font-medium",
            description: "text-xs opacity-70",
          },
        }}
      />
    </div>
  );
}
