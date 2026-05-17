import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/__protected")({
  beforeLoad: ({ context }) => {
    if (!context.auth?.isSignedIn) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },

  component: () => <Outlet />,
});
