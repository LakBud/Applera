import { SignIn, useAuth } from "@clerk/clerk-react";
import { clerkAuthAppearance } from "../../utils/clerkStyle";
import { Loader } from "../../components/common/Loader";
import { AuthLayout } from "../../components/ui/layout";

export function SignInPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <Loader fullScreen text="Loading..." />;

  return (
    <AuthLayout subtitle="Welcome back — sign in to continue">
      <SignIn appearance={clerkAuthAppearance} routing="path" path="/auth/sign-in" signUpUrl="/auth/sign-up" />
    </AuthLayout>
  );
}
