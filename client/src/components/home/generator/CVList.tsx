import type { CVDocument } from "../../../api/schemas";
import { useCVs } from "../../../api";
import { Loader } from "../../common/Loader";

function CvListItem({ cv, selected, onSelect }: { cv: CVDocument; selected: boolean; onSelect: () => void }) {
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
  const pinnedCvs = cvs?.filter((cv: CVDocument) => cv.pinned) ?? [];

  if (isLoading)
    return (
      <p className="text-xs text-muted-foreground">
        <Loader />
      </p>
    );
  if (!pinnedCvs.length)
    return (
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          No pinned CVs. Pin up to 5 CVs from your{" "}
          <a href="/cvs" className="underline">
            CV library
          </a>
          .
        </p>
      </div>
    );

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
