import { Briefcase } from 'lucide-react';
import { useApplications } from '../../api/hooks/useApplication';
import { StatusSummary } from '../../components/applications/StatusSummary';
import { ApplicationRow } from '../../components/applications/ApplicationRow';
import { ApplicationRowSkeleton } from '../../components/applications/ApplicationRowSkeleton';

export function ApplicationsPage() {
  const { data: applications, isLoading, isError } = useApplications();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {isLoading && (
        <div className="border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <ApplicationRowSkeleton />
                <ApplicationRowSkeleton />
              </div>
              <ApplicationRowSkeleton />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-border px-4 py-16 text-center text-sm text-muted-foreground">
          Failed to load applications. Please try again.
        </div>
      )}

      {applications && applications.length === 0 && (
        <div className="border border-border px-4 py-20 text-center text-muted-foreground">
          <Briefcase className="w-7 h-7 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No applications yet.</p>
          <p className="text-xs mt-1">Create one by matching a CV to a job.</p>
        </div>
      )}

      {applications && applications.length > 0 && (
        <>
          <StatusSummary applications={applications} />
          <div className="border border-border divide-y divide-border">
            {applications.map((app) => (
              <ApplicationRow key={app._id} application={app} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
