type Props = {
  completeness: number;
  missing: string[];
};

export function CVCompletenessBar({ completeness, missing }: Props) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <div className="text-5xl font-bold font-display text-tx-h1 tracking-tight">{completeness}%</div>
        <div className="text-xs uppercase tracking-widest text-tx-muted mt-1">CV Completeness</div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${completeness}%` }} />
        </div>
        {missing.length > 0 && (
          <p className="text-xs text-tx-muted">
            Missing: <span className="text-tx-body font-medium">{missing.join(", ")}</span>
          </p>
        )}
      </div>
    </div>
  );
}
