import { createFileRoute } from '@tanstack/react-router';

import { ApplicationsPage } from '../../../pages/application/Applications';

export const Route = createFileRoute('/__protected/applications/')({
  component: ApplicationsPage,
});
