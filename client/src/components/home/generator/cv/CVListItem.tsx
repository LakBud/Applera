import type { CVDocument } from "../../../../api/schemas";

export function CvListItem({ cv, selected, onSelect }: { cv: CVDocument; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`relative w-16 h-20 border rounded-lg cursor-pointer transition overflow-hidden shrink-0
  ${selected ? "border-2 border-green-600" : "border-border hover:bg-muted/40"}`}
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
