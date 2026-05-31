import type { CVDocument } from "../../api/schemas";
import { useCVs } from "../../api";

function CvListItem({ cv, selected, onSelect }: { cv: CVDocument; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`relative w-24 h-32 border rounded-lg cursor-pointer transition overflow-hidden shrink-0
        ${selected ? "border-green-600 ring-2 ring-green-500" : "border-border hover:bg-muted/40"}`}
    >
      {cv.previewImageUrl ? (
        <img src={cv.previewImageUrl} alt="CV preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted p-2">
          <span className="text-xs text-muted-foreground text-center warp-break-words leading-tight">
            {cv.parsed?.name || "Untitled CV"}
          </span>
        </div>
      )}
    </div>
  );
}

export function CvList({
  onSelectCv,
  onDeselectCv,
  selectedCvId,
}: {
  onSelectCv?: (id: string) => void;
  onDeselectCv?: () => void;
  selectedCvId?: string | null;
}) {
  const { data: cvs, isLoading } = useCVs();

  if (isLoading) return <p className="text-xs text-muted-foreground">Loading CVs...</p>;
  if (!cvs?.length) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs text-muted-foreground">Or select an existing CV</p>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {cvs.map((cv: CVDocument) => (
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
