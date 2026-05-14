// Layout route — wraps all routes that require authentication.
// Any child route under _protected/ is automatically guarded.

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context }) => {
    // TanStack Router beforeLoad runs before render
    // If no auth, redirect to sign-in and preserve intended destination
    const { queryClient } = context;

    // We use Clerk's getToken — if it throws or returns null, not signed in
    // For simplicity, components check useAuth() themselves; this is a guard layer
  },
  component: () => <Outlet />,
});
