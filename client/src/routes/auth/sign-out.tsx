import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export const Route = createFileRoute("/auth/sign-out")({
  component: SignOutPage,
});

function SignOutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    const run = async () => {
      await signOut();
      window.location.href = "/sign-in";
    };

    run();
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="text-center space-y-2">
        <p className="text-h1 font-display text-xl">Signing you out...</p>
        <p className="text-secondary text-sm">See you soon</p>
      </div>
    </div>
  );
}
