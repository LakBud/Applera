import { FileText } from 'lucide-react';

type CVPreviewFallbackProps = {
  label?: string;
  size?: 'default' | 'compact';
};

export function CVPreviewFallback({
  label = 'No preview available',
  size = 'default',
}: CVPreviewFallbackProps) {
  if (size === 'compact') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
        <FileText className="w-5 h-5 opacity-30" />
        <span className="text-[9px] opacity-50 px-1 leading-tight truncate w-full text-center">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <FileText className="w-10 h-10 opacity-30" />
      <span className="text-xs opacity-50">{label}</span>
    </div>
  );
}
