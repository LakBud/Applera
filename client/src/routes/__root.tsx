import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { useAuth } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";
import Nav from "../components/common/nav";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      <Nav isSignedIn={!!isSignedIn} />

      {/* Page content */}
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
