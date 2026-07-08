import { cn } from '@/lib/utils';
import type { SeniorityFit } from '@applera/schemas';

type Props = {
  score: number;
  scoreColor: string;
  barColor: string;
  strengths?: string[];
  missingSkills?: string[];
  recommendation: string;
  seniorityFit: SeniorityFit;
  domainMismatch: boolean;
};

export function ApplicationScorePanel({
  score,
  scoreColor,
  barColor,
  strengths,
  missingSkills,
  recommendation,
  seniorityFit,
  domainMismatch,
}: Props) {
  const SENIORITY_FIT_LABELS = {
    under: 'Role requires more seniority',
    over: 'You exceed role seniority',
    match: 'Perfect seniority match',
  } as const;

  const SENIORITY_FIT_STATUS_COLORS = {
    under: 'bg-green-900',
    over: 'bg-green-500',
    match: 'bg-green-500',
  } as const;

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

        <p className="text-sm font-medium text-h2">{recommendation}</p>
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

      {/* Status */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-label">Status</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {seniorityFit !== 'unknown' && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full shrink-0',
                  SENIORITY_FIT_STATUS_COLORS[seniorityFit],
                )}
              />

              <span className="text-xs text-body">{SENIORITY_FIT_LABELS[seniorityFit]}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full shrink-0',
                domainMismatch ? 'bg-green-900' : 'bg-green-500',
              )}
            />

            <span className="text-xs text-body">
              {domainMismatch ? 'Domain mismatch' : 'Domain match'}
            </span>
          </div>
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
