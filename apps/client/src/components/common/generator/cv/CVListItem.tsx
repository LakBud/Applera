import { Button } from '@/components/ui/button';

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
  return (
    <Button
      type="button"
      onClick={onSelect}
      className={`relative w-16 h-20 border rounded-lg cursor-pointer transition overflow-hidden shrink-0 appearance-none p-0
  ${selected ? 'border-2 border-green-600' : 'border-border hover:bg-muted/40'}`}
    >
      {cv.previewUrl ? (
        <>
          <img src={cv.previewUrl} alt="CV preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-green-950/50 px-1 py-0.5">
            <p className="text-[9px] text-white truncate leading-tight">{cv.parsed?.name}</p>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted p-2">
          <span className="text-xs text-muted-foreground text-center warp-break-words leading-tight">
            {cv.parsed?.name || 'Untitled CV'}
          </span>
        </div>
      )}
    </Button>
  );
}
