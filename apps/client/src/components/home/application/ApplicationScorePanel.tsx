type Props = {
  score: number;
  scoreColor: string;
  barColor: string;
  scoreLabel: string;
  strengths?: string[];
  missingSkills?: string[];
};

export function ApplicationScorePanel({
  score,
  scoreColor,
  barColor,
  scoreLabel,
  strengths,
  missingSkills,
}: Props) {
  return (
    <div className="border-b md:border-b-0 md:border-r border-border p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Score ring */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-primary/20 bg-primary/5">
          <span className={`text-4xl font-bold font-mono leading-none ${scoreColor}`}>{score}</span>

          <span className="text-[10px] uppercase tracking-widest text-label mt-1">match</span>

          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - score / 100)}`}
              strokeLinecap="round"
              className={scoreColor}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-h2">{scoreLabel}</p>
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>

        <div className="flex flex-wrap gap-1.5">
          {strengths?.length ? (
            strengths.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-caption text-xs">—</span>
          )}
        </div>
      </div>

      {/* Gaps */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-label">Gaps</p>

        <div className="flex flex-wrap gap-1.5">
          {missingSkills?.length ? (
            missingSkills.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 rounded-lg text-green-900 border border-error/20"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-primary">Perfect match</span>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between text-xs text-caption">
          <span>Fit score</span>
          <span>{score}%</span>
        </div>

        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
