import { createFileRoute } from '@tanstack/react-router';
import { CVDetailPage } from '../../../pages/cv/CVDetail';

export const Route = createFileRoute('/__protected/cvs/$cvId')({
  component: CVDetailPage,
});
