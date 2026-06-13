import { SignUp, useAuth } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';

import { Loader } from '../../components/common/Loader';
import { AuthLayout } from '../../components/ui/layout';
import { clerkAuthAppearance } from '../../utils/clerkStyle';

export function SignUpPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <Loader fullScreen text="Loading..." />;

  return (
    <AuthLayout
      subtitle={
        <>
          <p className="text-tx-muted text-sm text-center max-w-sm leading-relaxed">
            By signing up, you agree to our{' '}
            <Link
              to="/terms"
              className="text-green-800 underline underline-offset-2 hover:opacity-80 transition"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-green-800 underline underline-offset-2 hover:opacity-80 transition"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </>
      }
    >
      <SignUp
        appearance={clerkAuthAppearance}
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
      />
    </AuthLayout>
  );
}
