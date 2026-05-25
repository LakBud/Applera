import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text px-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="font-display text-2xl text-h1 hover:text-tx-h2 transition-colors">
            Applera
          </Link>
          <p className="text-sm text-secondary mt-2">Create your account to start generating applications</p>
        </div>

        {/* Clerk Sign Up */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-h1",
                headerSubtitle: "text-secondary",
                formButtonPrimary: "bg-primary hover:bg-primary-hover text-white rounded-lg transition",
                formFieldInput: "bg-bg border border-border text-tx-body rounded-lg focus:border-primary/40",
                footerActionLink: "text-primary hover:text-h2",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
