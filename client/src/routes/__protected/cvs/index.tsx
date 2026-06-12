import { createFileRoute } from '@tanstack/react-router';
import { CVsPage } from '../../../pages/cv/CVs';

export const Route = createFileRoute('/__protected/cvs/')({
  component: CVsPage,
});
