type Props = {
  successRate: number;
  totalApplications: number;
  avgScore: number;
  bestScore: number;
};

export function CVStats({ successRate, totalApplications, avgScore, bestScore }: Props) {
  const stats = [
    { label: 'Applications', value: totalApplications },
    { label: 'Avg Score', value: `${avgScore}%` },
    { label: 'Best Score', value: `${bestScore}%` },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* main metric */}
      <div className="flex items-end gap-3">
        <div className="text-4xl font-bold font-display text-tx-h1">{successRate}%</div>
        <div className="text-[11px] uppercase tracking-widest text-tx-muted pb-1">Success Rate</div>
      </div>

      {/* inline stats row */}
      <div className="flex gap-3 flex-wrap">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="
              flex items-baseline gap-2
              px-2 py-1 p-1
              rounded-lg
              bg-white/30
              border
              border-border
              backdrop-blur
            "
          >
            <span className="text-sm font-semibold text-tx-h1">{value}</span>
            <span className="text-[10px] uppercase text-tx-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
