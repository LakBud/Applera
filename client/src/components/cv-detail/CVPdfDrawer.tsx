import { X } from "lucide-react";
import { Button } from "../ui/button";

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  previewImageUrl?: string;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, previewImageUrl }: CVPdfDrawerProps) {
  if (!open || !pdfUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 animate-fade-in bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-surface bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-tx-h1">CV Preview</p>
            <p className="text-xs text-tx-muted">Read-only document view</p>
          </div>
          <Button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-tx-muted hover:text-tx-body hover:bg-surface-muted transition"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="overflow-auto flex-1 p-4 bg-surface-muted">
          <img src={previewImageUrl ?? pdfUrl} alt="CV preview" className="w-full object-contain rounded-lg shadow-sm" />
        </div>
      </div>
    </div>
  );
}
