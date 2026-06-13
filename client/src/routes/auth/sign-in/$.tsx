import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from '../../../pages/auth/SignIn';

export const Route = createFileRoute('/auth/sign-in/$')({
  component: SignInPage,
});
