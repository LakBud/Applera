import { createFileRoute } from '@tanstack/react-router';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

export const Route = createFileRoute('/__protected')({
  component: ProtectedLayout,
});
