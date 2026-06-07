type Props = {
  completeness: number;
  missing: string[];
};

export function CVCompletenessBar({ completeness, missing }: Props) {
  const value = Math.max(0, Math.min(100, Number(completeness ?? 0)));
  return (
    <div className="flex flex-col gap-3 pb-2.5">
      {/* headline metric */}
      <div className="flex items-end gap-3">
        <div className="text-4xl font-bold font-display text-tx-h1 mt-3">{completeness}%</div>
        <div className="text-[11px] uppercase tracking-widest text-tx-muted pb-1">Completeness</div>
      </div>

      {/* progress */}
      <div className="w-full h-6 bg-surface-muted rounded-lg relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-[#1fa028] transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            minWidth: value > 0 ? "2px" : "0px",
          }}
        />
      </div>

      {/* missing */}
      {missing.length > 0 && (
        <div className="text-xs text-tx-muted">
          Missing <span className="text-tx-body font-medium">{missing.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
