import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import Nav from "../components/common/Nav";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Loader2 } from "lucide-react";
import { Toaster } from "../components/ui/sonner";
import { NotFoundPage } from "../pages/NotFound";

interface RouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: GlobalPending,
  notFoundComponent: NotFoundPage,
  component: RootLayout,
});

function GlobalPending() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-green-800" />
    </div>
  );
}

function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

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
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}
