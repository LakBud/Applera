import { ArrowRight, X } from "lucide-react";
import { Button } from "../ui/button";
import { Loader } from "../common/Loader";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  previewUrl?: string;
  isLoading: boolean;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, previewUrl, isLoading }: CVPdfDrawerProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setImgLoaded(false);
    }
  }, [open, previewUrl]);

  const isImage = !!previewUrl;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-green-50/20 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 animate-fade-in"
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
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-border shrink-0">
          <div className="flex flex-1 items-center text-center gap-2">
            <p className="text-sm font-semibold text-tx-h1">CV Preview</p>

            <ArrowRight size={15} className="text-tx-muted " />

            <a
              href={isLoading ? undefined : pdfUrl}
              onClick={isLoading ? (e) => e.preventDefault() : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs underline underline-offset-2 transition ${
                isLoading ? "text-tx-muted opacity-50 cursor-not-allowed pointer-events-none" : "text-tx-muted hover:text-tx-body"
              }`}
            >
              Open PDF
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-black hover:text-tx-body hover:bg-surface-muted transition"
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
          {isImage ? (
            <img
              src={previewUrl}
              alt="CV preview"
              onLoad={() => setImgLoaded(true)}
              className={cn(
                "w-full object-contain rounded-lg shadow-sm transition-opacity duration-300",
                imgLoaded ? "opacity-100" : "opacity-0",
              )}
            />
          ) : (
            <iframe src={pdfUrl} className="w-full h-[80vh] rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}
