import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import Nav from "../components/common/Nav";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Loader2 } from "lucide-react";

function GlobalPending() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

interface RouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: GlobalPending,
  component: RootLayout,
});

function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Nav isSignedIn={!!isSignedIn} isLoaded={isLoaded} />
      <main className="pt-14">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}
