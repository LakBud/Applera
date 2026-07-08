import { Fragment } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, FileText } from 'lucide-react';

type Props = {
  jobTitle?: string;
  cvId?: string;
  cvName?: string;
  company?: string;
  location?: string;
  seniority?: string;
  createdAtLabel: string;
};

export function ApplicationDetailHeader({
  jobTitle,
  company,
  location,
  seniority,
  createdAtLabel,
  cvId,
  cvName,
}: Props) {
  const navigate = useNavigate();

  const metaItems: React.ReactNode[] = [
    seniority && seniority !== 'unknown' && (
      <span key="seniority" className="capitalize">
        {seniority}
      </span>
    ),
    company && <span key="company">{company}</span>,
    location && <span key="location">{location}</span>,
    <span key="createdAt">{createdAtLabel}</span>,
    cvId && (
      <button
        key="cv"
        type="button"
        onClick={() => navigate({ to: '/cvs/$cvId', params: { cvId } })}
        className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors appearance-none border-0 p-0 font-normal"
      >
        <FileText className="w-3 h-3" />
        {cvName ?? 'View CV'}
        <ArrowRight className="w-3 h-3" />
      </button>
    ),
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-tx-h1 leading-tight">
        {jobTitle ?? 'Untitled Role'}
      </h1>

      <div className="flex items-center gap-2 flex-wrap text-xs text-tx-muted">
        {metaItems.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="text-tx-muted/40">·</span>}
            {item}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
