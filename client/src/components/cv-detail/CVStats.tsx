type Props = {
  successRate: number;
  totalApplications: number;
  avgScore: number;
  bestScore: number;
};

export function CVStats({ successRate, totalApplications, avgScore, bestScore }: Props) {
  const stats = [
    { label: "Applications", value: totalApplications },
    { label: "Avg Score", value: `${avgScore}%` },
    { label: "Best Score", value: `${bestScore}%` },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <div className="text-5xl font-bold font-display text-tx-h1 tracking-tight">{successRate}%</div>
        <div className="text-xs uppercase tracking-widest text-tx-muted mt-1">Success Rate</div>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-1">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-surface-muted rounded-xl px-3 py-2.5 space-y-0.5">
            <div className="text-sm font-semibold text-tx-h1">{value}</div>
            <div className="text-[10px] uppercase tracking-wider text-tx-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
