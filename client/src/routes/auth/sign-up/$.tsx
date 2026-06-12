import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from '../../../pages/auth/SignUp';

export const Route = createFileRoute('/auth/sign-up/$')({
  component: SignUpPage,
});
