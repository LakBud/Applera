import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useUploaderHandlers, useUploaderState } from '../context/UploaderContext';
import { UploadSuccess } from '../ui/UploadSuccess';

export function TextModePanel({ label, placeholder }: { label: string; placeholder?: string }) {
  const { text, isUploading, isSelected } = useUploaderState();
  const { onTextChange, onTextSubmit, onClear } = useUploaderHandlers();
  if (isSelected) {
    return (
      <div className="border border-green-600 bg-green-50 rounded-xl p-6 text-center min-h-50 md:h-80 flex flex-col items-center justify-center">
        <UploadSuccess label={label} onClear={onClear} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        disabled={isUploading}
        className="w-full h-[28vh] sm:h-[26vh] md:h-[34vh] resize-none bg-bg border border-border rounded-xl p-4 text-sm text-body focus:outline-none focus:ring-green-800/40 disabled:opacity-60 transition"
      />
      <Button
        type="button"
        onClick={onTextSubmit}
        disabled={!text.trim() || isUploading}
        className="w-full px-4 py-3 rounded-md btn-secondary text-white text-sm font-semibold hover:bg-primary-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isUploading ? `Processing ${label.toLowerCase()}...` : `Save ${label}`}
      </Button>
    </div>
  );
}
