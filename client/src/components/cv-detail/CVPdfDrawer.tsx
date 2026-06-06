import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Loader } from "../common/Loader";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  previewImageUrl?: string;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, previewImageUrl }: CVPdfDrawerProps) {
  if (!open || !pdfUrl) return null;
  const [imgLoaded, setImgLoaded] = useState(false);
  const src = previewImageUrl ?? pdfUrl;

  return (
    <div
      className="fixed inset-0 z-50 bg-green-50/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface bg-[#f7fff5] rounded-md shadow-xl w-full sm:max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-tx-h1">CV Preview</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-tx-muted hover:text-tx-body underline
              underline-offset-2 transition"
            >
              Open PDF
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-tx-muted hover:text-tx-body hover:bg-surface-muted transition"
          >
            <X size={16} />
          </Button>
        </div>

        {/* content */}
        <div className="overflow-auto flex-1 p-4 bg-surface-muted relative">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader />
            </div>
          )}
          {src && (
            <img
              src={src}
              alt="CV preview"
              onLoad={() => setImgLoaded(true)}
              className={cn(
                "w-full object-contain rounded-lg shadow-sm transition-opacity duration-300",
                imgLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
