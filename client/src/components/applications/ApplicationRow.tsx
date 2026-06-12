import { useNavigate } from '@tanstack/react-router';
import { FileText, TrendingUp, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { STATUS_STYLES } from '../../utils/statusStyles';
import type { Application } from '../../api/schemas';
import { RowBase } from '../ui/row';

export function ApplicationRow({ application }: { application: Application }) {
  const navigate = useNavigate();

  const status = STATUS_STYLES[application.status] ?? {
    label: application.status,
    className: 'bg-gray-100 text-gray-600',
  };

  const jobDoc = typeof application.job === 'object' ? application.job : null;
  const cvDoc = typeof application.cv === 'object' ? application.cv : null;

  const jobTitle = application.jobTitleSnapshot ?? jobDoc?.parsed?.title ?? 'Untitled Role';
  const company = application.companySnapshot ?? jobDoc?.company ?? 'Unknown Company';
  const cvName = application.cvNameSnapshot ?? cvDoc?.parsed?.name ?? 'CV';
  const score = application.match?.score;
  const jobLocation = application.locationSnapshot;

  return (
    <RowBase
      onClick={() =>
        navigate({
          to: '/applications/$applicationId',
          params: { applicationId: application._id },
        })
      }
      left={
        <>
          <p className="text-sm font-medium truncate">{jobTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{company}</p>
          {jobLocation && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {jobLocation}
            </span>
          )}
        </>
      }
      middle={
        <>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {cvName}
          </span>

          {score !== undefined && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {score}%
            </span>
          )}
        </>
      }
      right={
        <>
          <span className="hidden sm:block text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(application.createdAt!), {
              addSuffix: true,
            })}
          </span>

          <Badge variant="outline" className={`text-xs font-medium ${status.className}`}>
            {status.label}
          </Badge>
        </>
      }
    />
  );
}
