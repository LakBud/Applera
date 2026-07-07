import { Button } from '@/components/ui/button';

import { CVPreviewFallback } from '../../cv/CVPreviewFallback';

import { useAuthenticatedCVImage } from '@/hooks/common/useAuthenticatedCVImage';
import type { CVDocument } from '@repo/schemas';

export function CvListItem({
  cv,
  selected,
  onSelect,
}: {
  cv: CVDocument;
  selected: boolean;
  onSelect: () => void;
}) {
  const previewSrc = useAuthenticatedCVImage(cv.previewUrl ?? null);
  return (
    <Button
      type="button"
      onClick={onSelect}
      className={`relative w-16 h-20 border rounded-lg cursor-pointer transition overflow-hidden shrink-0 appearance-none p-0
  ${selected ? 'border-2 border-green-600' : 'border-border hover:bg-muted/40'}`}
    >
      {previewSrc ? (
        <>
          <img src={previewSrc} alt="CV preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-green-950/50 px-1 py-0.5">
            <p className="text-[9px] text-white truncate leading-tight">{cv.parsed?.name}</p>
          </div>
        </>
      ) : (
        <CVPreviewFallback label={cv.parsed?.name || 'No preview'} size="compact" />
      )}
    </Button>
  );
}
