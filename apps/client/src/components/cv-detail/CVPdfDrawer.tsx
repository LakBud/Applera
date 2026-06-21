import { ArrowRight } from 'lucide-react';

import { Loader } from '../common/Loader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  previewUrl?: string;
  isLoading: boolean;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, previewUrl, isLoading }: CVPdfDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col bg-[#f7fff5] ring-green-100">
        {/* header */}
        <DialogHeader className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-semibold text-tx-h1">CV Preview</DialogTitle>

            <ArrowRight size={15} className="text-tx-muted" />

            <a
              href={isLoading ? undefined : pdfUrl}
              onClick={isLoading ? (e) => e.preventDefault() : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm pb-0.5 underline underline-offset-2 transition ${
                isLoading
                  ? 'text-tx-muted opacity-50 pointer-events-none'
                  : 'text-tx-muted hover:text-tx-body'
              }`}
            >
              Open PDF
            </a>
          </div>
        </DialogHeader>

        {/* content */}
        <div className="overflow-auto flex-1 p-4 bg-surface-muted">
          {isLoading ? (
            <Loader />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt="CV preview"
              className="w-full object-contain rounded-lg shadow-sm"
            />
          ) : (
            <p className="text-sm text-tx-muted">No preview available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
