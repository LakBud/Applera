import { SignIn, useAuth } from '@clerk/clerk-react';

import { Loader } from '../../components/common/Loader';
import { AuthLayout } from '../../components/ui/layout';
import { clerkAuthAppearance } from '../../utils/ui/clerkStyle';

export function SignInPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <Loader fullScreen text="Loading..." />;

  return (
    <AuthLayout>
      <div className="w-full flex justify-center sm:block">
        <div className="w-full max-w-md">
          <SignIn
            appearance={clerkAuthAppearance}
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
          />
        </div>
      </div>
    </AuthLayout>
  );
}
