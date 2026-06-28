import { useState } from 'react';

import { getToken } from '@clerk/react';
import { ArrowRight, ExternalLink } from 'lucide-react';

import { Loader } from '../common/Loader';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

import { getCVPreview } from '@/api/cv/cv.api';

interface CVPdfDrawerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl?: string;
  previewSrc?: string | null;
  isLoading: boolean;
}

export function CVPdfDrawer({ open, onClose, pdfUrl, previewSrc, isLoading }: CVPdfDrawerProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenPdf = async () => {
    if (!pdfUrl) {
      return;
    }

    const popup = window.open('', '_blank');
    if (!popup) {
      return;
    }

    setIsOpening(true);
    try {
      const token = await getToken();
      const res = await getCVPreview(pdfUrl, token);
      const url = URL.createObjectURL(res);
      popup.location.href = url;
    } catch (error) {
      popup.close();
      throw error;
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col bg-[#f7fff5] ring-green-100">
        {/* header */}
        <DialogHeader className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-semibold text-tx-h1">CV Preview</DialogTitle>

            <ArrowRight size={15} className="text-tx-muted" />

            <Button
              onClick={handleOpenPdf}
              disabled={isOpening}
              variant="outline"
              size="sm"
              className="gap-1.5 text-green-700 hover:bg-green-50 hover:text-green-800"
            >
              {isOpening ? <Loader size="sm" /> : <ExternalLink size={13} />}
              {isOpening ? 'Opening...' : 'Open PDF'}
            </Button>
          </div>
        </DialogHeader>

        {/* content */}
        <div className="overflow-auto flex-1 p-4 bg-surface-muted">
          {isLoading ? (
            <Loader />
          ) : previewSrc ? (
            <img
              src={previewSrc}
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
