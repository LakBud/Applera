import { ArrowRight, X } from "lucide-react";
import { Button } from "../ui/button";
import { Loader } from "../common/Loader";

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string | null;
  isLoading: boolean;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, isLoading }: CVPdfDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-green-50/20 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#f7fff5] rounded-md shadow-xl w-full sm:max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">CV Preview</p>

            <ArrowRight size={14} className="text-tx-muted" />

            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-tx-muted hover:text-tx-body"
              >
                Open PDF
              </a>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* content */}
        <div className="flex-1 bg-surface-muted relative">
          {!pdfUrl ? (
            <div className="flex items-center justify-center h-full text-sm text-tx-muted">No PDF available</div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : (
            <iframe src={pdfUrl} className="w-full h-[85vh]" style={{ border: "none" }} />
          )}
        </div>
      </div>
    </div>
  );
}
