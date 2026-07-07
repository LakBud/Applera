import { SignUp, useAuth } from '@clerk/react';

import { Loader } from '../../components/common/Loader';
import { AuthLayout } from '../../components/ui/layout';
import { clerkAuthAppearance } from '../../utils/ui/clerkStyle';

export function SignUpPage() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <Loader fullScreen text="Loading..." />;
  }

  return (
    <AuthLayout>
      <SignUp
        appearance={clerkAuthAppearance}
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
      />
    </AuthLayout>
  );
}
