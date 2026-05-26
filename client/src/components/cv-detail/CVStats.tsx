type Props = {
  successRate: number;
  totalApplications: number;
  avgScore: number;
  bestScore: number;
};

export function CVStats({ successRate, totalApplications, avgScore, bestScore }: Props) {
  return (
    <div className="flex flex-col justify-center gap-3 h-full w-full">
      {/* Anchor */}
      <div className="leading-none">
        <div className="text-5xl font-bold font-display text-tx-h1">{successRate}%</div>

        <div className="text-xs uppercase tracking-widest text-tx-muted mt-1">Success Rate</div>
      </div>

      {/* Drift */}
      <div className="flex flex-wrap gap-5 text-sm text-tx-muted">
        <div>
          <span className="text-tx-h1 font-semibold">{totalApplications}</span> apps
        </div>

        <div>
          <span className="text-tx-h1 font-semibold">{avgScore}%</span> avg
        </div>

        <div>
          <span className="text-tx-h1 font-semibold">{bestScore}%</span> best
        </div>
      </div>
    </div>
  );
}
