import type { DashboardCV } from '@/api/cv/cv.schemas';

import { Link } from '@tanstack/react-router';

import { StatusSummary } from '../../../applications/StatusSummary';
import { Button } from '../../../ui/button';
import { CVApplicationRow } from './CVApplicationRow';
import { CVApplicationRowSkeleton } from './CVApplicationRowSkeleton';

type DashboardApplication = DashboardCV['applications'][number];
interface CVApplicationsProps {
  applications: DashboardApplication[];
  isLoading: boolean;
}

export function CVApplications({ applications, isLoading }: CVApplicationsProps) {
  if (!applications.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-tx-muted text-sm">No applications yet with this CV.</p>
        <Link to="/">
          <Button size="sm" className="text-xs font-semibold btn-glow">
            Create your first application →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. summary strip */}
      <StatusSummary applications={applications} />

      {/* 2. list */}
      <div>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <CVApplicationRowSkeleton key={i} />)
          : applications.map((app) => <CVApplicationRow key={app._id} application={app} />)}
      </div>
    </div>
  );
}
