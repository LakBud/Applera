import { CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/button";

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
      <p className="text-sm text-green-800 font-medium">{label} saved</p>
      <Button
        type="button"
        onClick={onClick ?? onClear}
        className="text-xs text-shadow-green-700 text-muted-foreground hover:text-foreground underline transition-colors"
      >
        Remove
      </Button>
    </div>
  );
}
