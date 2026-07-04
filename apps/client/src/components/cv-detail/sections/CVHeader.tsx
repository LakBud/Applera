import { Link } from '@tanstack/react-router';

import { isValidSeniority } from '../../../utils/cv-id/isValidSeniority';
import { Button } from '../../ui/button';

type Props = {
  name?: string;
  seniority?: string;
  updatedAtLabel: string;
  showPdf: boolean;
  onOpenPdf: () => void;
};

export function CVHeaderSection({ name, seniority, updatedAtLabel, showPdf, onOpenPdf }: Props) {
  const hasSeniority = isValidSeniority(seniority);

  return (
    <div className="space-y-5">
      {/*  Breadcrumb  */}
      <div className="flex items-center gap-2 text-xs text-tx-muted w-full">
        <Link to="/cvs" className="hover:text-primary transition-colors">
          CVs
        </Link>

        <span className="text-tx-muted/50">›</span>

        <span className="text-tx-body font-medium truncate max-w-50">{name || 'Untitled CV'}</span>

        {showPdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPdf}
            className="
        ml-auto
        text-xs
        border-primary/20
        text-primary
        hover:bg-primary/10
        hover:border-primary/30
        transition
      "
          >
            View PDF
          </Button>
        )}
      </div>

      {/*  HERO HEADER  */}
      <div className="flex items-start justify-between gap-6">
        {/* LEFT */}
        <div className="space-y-2">
          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-tx-h1 leading-tight">
            {name || 'Untitled CV'}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-tx-muted">
            {hasSeniority && <span className="capitalize">{seniority}</span>}
            {hasSeniority && <span className="text-tx-muted/40">·</span>}
            <span>{updatedAtLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
