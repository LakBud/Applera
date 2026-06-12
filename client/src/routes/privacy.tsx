import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPage } from '../pages/Privacy';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});
