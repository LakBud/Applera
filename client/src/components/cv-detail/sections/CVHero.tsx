import { Link } from "@tanstack/react-router";
import { Button } from "../../ui/button";

type Props = {
  name?: string;
  seniority?: string;
  updatedAtLabel: string;
  showPdf: boolean;
  onOpenPdf: () => void;
};

export function isValidSeniority(value?: string) {
  if (!value) return false;
  return value !== "unknown";
}

export function CVHero({ name, seniority, updatedAtLabel, showPdf, onOpenPdf }: Props) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tx-muted">
        <Link to="/cvs" className="hover:text-tx-secondary transition">
          CVs
        </Link>
        <span>/</span>
        <span className="text-tx-body">{name || "Untitled"}</span>
      </div>

      {/* Header + CTA */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-4xl text-tx-h1 leading-tight">{name || "Untitled CV"}</h1>

          <p className="text-sm text-tx-muted">
            {isValidSeniority(seniority) && <span className="mr-2 capitalize">{seniority}</span>}
            {updatedAtLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showPdf && (
            <Button variant="outline" size="sm" onClick={onOpenPdf} className="text-xs">
              View PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
