import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__protected")({
  beforeLoad: ({ context }) => {
    if (context.auth?.isLoaded && !context.auth?.isSignedIn) {
      throw redirect({ to: "/auth/sign-up" });
    }
  },

  component: () => <Outlet />,
});
