import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, FileText, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

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
  const meta = [company, location, createdAtLabel].filter(Boolean);

  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-tx-h1 leading-tight">
        {jobTitle ?? 'Untitled Role'}
      </h1>

      <div className="flex items-center gap-2 flex-wrap text-xs text-tx-muted">
        {seniority && seniority !== 'unknown' && <span className="capitalize">{seniority}</span>}

        {meta.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            {(i > 0 || seniority) && <span className="text-tx-muted/40">·</span>}
            {item === location && <MapPin className="w-3 h-3" />}
            {item}
          </span>
        ))}

        {cvId && (
          <>
            <span className="text-tx-muted/40">·</span>
            <Button
              type="button"
              onClick={() => navigate({ to: '/cvs/$cvId', params: { cvId } })}
              className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors appearance-none bg-transparent border-0 p-0"
            >
              <FileText className="w-3 h-3" />
              {cvName ?? 'View CV'}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
