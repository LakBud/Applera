import { createFileRoute } from '@tanstack/react-router';

import { TermsPage } from '../pages/Terms';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});
