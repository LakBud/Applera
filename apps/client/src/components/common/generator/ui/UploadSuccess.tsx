import { CheckCircle2, X } from 'lucide-react';

import { Button } from '../../../ui/button';

export function UploadSuccess({
  label,
  onClear,
  onClick,
}: {
  label: string;
  onClear: () => void;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <CheckCircle2 className="w-10 h-10 text-green-600" />
      <p className="text-md text-green-700 font-medium">{label} Uploaded!</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Remove ${label}`}
        onClick={onClick ?? onClear}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-green-900 hover:text-green-800 cursor-pointer"
      >
        <X className="w-4 h-4" /> Remove
      </Button>
    </div>
  );
}
