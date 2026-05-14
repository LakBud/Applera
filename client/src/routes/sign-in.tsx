import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl">Logg inn</h1>
          <p className="text-[#555] text-sm">Fortsett til søknad.ai</p>
        </div>
        <div className="flex justify-center">
          <SignIn
            routing="hash"
            afterSignInUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#c9a96e",
                colorBackground: "#111",
                colorText: "#e8e4dc",
                colorInputText: "#e8e4dc",
                borderRadius: "8px",
              },
              elements: {
                card: "bg-[#111] border border-white/5 shadow-none",
                headerTitle: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
