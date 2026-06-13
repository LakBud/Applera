import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__protected')({
  component: ProtectedLayout,
});
