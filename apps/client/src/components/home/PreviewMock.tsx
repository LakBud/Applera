import { cn } from '../../lib/utils';

type Tab = 'Cover letter' | 'CV advice' | 'Email draft';

interface PreviewMockProps {
  skeleton?: boolean;
  score?: number;
  label?: string;
  strengths?: string[];
  gaps?: string[];
  activeTab?: Tab;
  content?: string;
  recommendation?: string;
}

// Subcomponents

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('bg-border/60 rounded animate-pulse', className)} />;
}

function ScoreRing({
  score,
  recommendation,
  skeleton,
}: {
  score: number;
  recommendation: string;
  skeleton?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-primary/20">
        {skeleton ? (
          <div className="w-28 h-28 rounded-full bg-border/40 animate-pulse" />
        ) : (
          <>
            <span className="text-4xl font-bold font-mono pb-3 text-tx-h1">{score}</span>

            <span className="absolute bottom-6 text-[10px] uppercase tracking-widest text-label">
              match
            </span>

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
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - score / 100)}
                strokeLinecap="round"
                className="text-success"
              />
            </svg>
          </>
        )}
      </div>

      {skeleton ? (
        <SkeletonBlock className="h-4 w-32" />
      ) : (
        <p className="text-sm font-medium text-h2 text-center">{recommendation}</p>
      )}
    </div>
  );
}
function TagList({
  items,
  variant,
  skeleton,
}: {
  items: string[];
  variant: 'strength' | 'gap';
  skeleton?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skeleton
        ? [60, 80, 50].map((_, i) => <SkeletonBlock key={i} className="h-6 rounded-lg" />)
        : items.map((s) => (
            <span
              key={s}
              className={cn(
                'text-xs px-2 py-1 rounded-lg border',
                variant === 'strength'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-green-900 border-error/20',
              )}
            >
              {s}
            </span>
          ))}
    </div>
  );
}

// Main Component

const TABS: Tab[] = ['Cover letter', 'CV advice', 'Email draft'];

export default function PreviewMock({
  skeleton = false,
  score = 87,
  strengths = ['React', 'TypeScript', 'API'],
  recommendation = 'Strong match: Apply immediately',
  gaps = ['Testing', 'System design'],
  activeTab = 'Cover letter',
  content = `Dear Hiring Manager,\n\nI am excited to apply for this position.\n\nWith my experience in React and TypeScript,\nI believe I would be a strong fit for your team.`,
}: PreviewMockProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/70 overflow-hidden shadow-sm box-border px-3 py-3 w-full mx-auto">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-3 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
      </div>

      <div className="grid md:grid-cols-[300px_1fr]">
        {/* LEFT */}
        <div className="border-b md:border-b-0 md:border-r border-border p-4 sm:p-5 md:p-6 space-y-6">
          <ScoreRing score={score} recommendation={recommendation} skeleton={skeleton} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>
            <TagList items={strengths} variant="strength" skeleton={skeleton} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Gaps</p>
            <TagList items={gaps} variant="gap" skeleton={skeleton} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Status</p>

            {skeleton ? (
              <div className="flex gap-5">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-xs text-body">Perfect seniority match</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-warning shrink-0" />
                  <span className="text-xs text-body">Domain mismatch</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-caption">
              {skeleton ? (
                <>
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-3 w-8" />
                </>
              ) : (
                <>
                  <span>Fit score</span>
                  <span>{score}%</span>
                </>
              )}
            </div>

            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              {skeleton ? (
                <div className="h-full w-1/2 bg-border/60 rounded-full animate-pulse" />
              ) : (
                <div
                  className="h-full bg-success rounded-full transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={cn(
                  'whitespace-nowrap px-4 sm:px-5 py-3.5 text-xs font-semibold tracking-wide border-b-2 -mb-px',
                  tab === activeTab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5 md:p-6 max-h-120 overflow-auto space-y-2">
            {skeleton ? (
              <>
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-5/6" />
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/6" />
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-3/4" />
              </>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
                {content}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
