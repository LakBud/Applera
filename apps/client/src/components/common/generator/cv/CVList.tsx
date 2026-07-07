import { useAuth } from '@clerk/react';
import { PinOff } from 'lucide-react';

import { useCVs } from '../../../../api';
import { CvListItem } from './CVListItem';

import type { CVDocument } from '@repo/schemas';

export function CvList({
  onSelectCv,
  onDeselectCv,
  selectedCvId,
}: {
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
  selectedCvId?: string | null;
}) {
  const { isSignedIn } = useAuth();
  const { data: cvs, isLoading } = useCVs();
  const pinnedCvs = cvs?.filter((cv: CVDocument) => cv.pinned) ?? [];

  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="h-3 w-32 bg-border/60 rounded animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-16 h-20 rounded-lg bg-border/60 animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!pinnedCvs.length) {
    return (
      <div className="pt-6 p-2 border-t md:pb-2 border-border flex flex-col items-center text-center">
        <PinOff className="h-4 w-4 text-muted-foreground mb-2 text-green-800" />
        <p className="text-xs font-medium">No pinned CVs</p>
        <p className="text-xs text-muted-foreground mt-1">
          Pin up to 5 CVs from your saved collection to access them quickly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs text-muted-foreground">Or select an existing CV</p>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {pinnedCvs.map((cv: CVDocument) => (
          <CvListItem
            key={cv._id}
            cv={cv}
            selected={selectedCvId === cv._id}
            onSelect={() => (selectedCvId === cv._id ? onDeselectCv?.() : onSelectCv?.(cv._id))}
          />
        ))}
      </div>
    </div>
  );
}
