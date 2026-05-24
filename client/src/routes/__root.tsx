import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import Nav from "../components/common/Nav";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface RouterContext {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Nav isSignedIn={!!isSignedIn} />
      <main className="pt-14">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}
