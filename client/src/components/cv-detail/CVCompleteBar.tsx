type Props = {
  completeness: number;
  missing: string[];
};

export function CVCompletenessBar({ completeness, missing }: Props) {
  return (
    <div className="flex flex-col justify-center gap-3 h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-tx-muted">
        <span>CV Completeness</span>
        <span className="text-tx-h1 font-semibold">{completeness}%</span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${completeness}%` }} />
      </div>

      {/* Micro insight */}
      {missing.length > 0 && (
        <div className="text-xs text-tx-muted leading-snug">
          Missing <span className="text-tx-h1 font-medium">{missing.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
