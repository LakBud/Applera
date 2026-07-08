import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';

import ApplicationResult from '@/components/common/application/ApplicationResult';

import { useApplication, useUpdateApplicationStatus } from '../../api';
import { useDeleteApplication } from '../../api/application/application.hook';
import { ApplicationActionSection } from '../../components/application-detail/ApplicationDetailAction';
import { ApplicationDetailHeader } from '../../components/application-detail/ApplicationDetailHeader';
import { InterviewPrepSection } from '../../components/application-detail/InterviewPrep';
import { JobListingSection } from '../../components/application-detail/JobListing';
import { Loader } from '../../components/common/Loader';
import { Route } from '../../routes/__protected/applications/$applicationId';

import type { ApplicationStatus } from '@applera/schemas';

export function ApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const navigate = useNavigate();
  const { data: application, isLoading, isError } = useApplication(applicationId);
  const { mutate: deleteApp, isPending: isDeleting } = useDeleteApplication();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateApplicationStatus();

  const handleDelete = () => {
    deleteApp(applicationId, {
      onSuccess: () => navigate({ to: '/applications' }),
    });
  };

  const handleStatusChange = (status: ApplicationStatus) => {
    updateStatus({ id: applicationId, status });
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (isError || !application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="border border-border px-4 py-16 text-center text-sm text-muted-foreground">
          Failed to load application. Please try again.
        </div>
      </div>
    );
  }

  const cv = typeof application.cv === 'object' ? application.cv : null;
  const job = typeof application.job === 'object' ? application.job : null;
  const formatDate = (d: string) => format(new Date(d), 'd MMM yyyy');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Actions */}
      <ApplicationActionSection
        jobTitle={job?.parsed?.title}
        status={application.status}
        isUpdatingStatus={isUpdatingStatus}
        isDeleting={isDeleting}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Header */}
      <ApplicationDetailHeader
        jobTitle={job?.parsed?.title}
        company={job?.parsed?.company}
        location={job?.parsed?.location}
        cvId={cv?._id}
        cvName={cv?.parsed?.name}
        seniority={job?.parsed?.seniority}
        createdAtLabel={`Applied ${formatDate(application.createdAt ?? '')}`}
      />

      {/* Result */}
      <ApplicationResult data={application} />

      <div className="grid grid-cols-2 gap-4 items-start">
        <JobListingSection
          company={job?.parsed?.company}
          location={job?.parsed?.location}
          rawText={job?.rawText}
          parsed={job?.parsed}
        />
        <InterviewPrepSection applicationId={applicationId} />
      </div>
    </div>
  );
}
