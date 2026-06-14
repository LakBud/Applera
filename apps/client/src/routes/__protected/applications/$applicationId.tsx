import { createFileRoute } from '@tanstack/react-router';

import { ApplicationDetailPage } from '../../../pages/application/ApplicationDetail';

export const Route = createFileRoute('/__protected/applications/$applicationId')({
  component: ApplicationDetailPage,
});
