export default function PreviewMock() {
  const score = 87;

  return (
    <div
      className="
        rounded-2xl border border-border bg-white/70 overflow-hidden shadow-sm
         box-border
        px-3 py-3
  w-full max-w-180 lg:w-180 mx-auto
      "
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 sm:px-5 py-3 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-caption">Application result</span>
      </div>

      <div className="grid md:grid-cols-[300px_1fr]">
        {/* LEFT */}
        <div className="border-b md:border-b-0 md:border-r border-border p-4 sm:p-5 md:p-6 space-y-6">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-primary/20 bg-tx-h1">
              <span className="text-4xl font-bold font-mono text-tx-h1">87</span>
              <span className="absolute bottom-4 text-[10px] uppercase tracking-widest text-label">match</span>

              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
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
            </div>

            <p className="text-sm font-medium text-h2">Strong match</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {["React", "TypeScript", "API"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {["Testing", "System design"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-lg text-green-900 border border-error/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-caption">
              <span>Fit score</span>
              <span>87%</span>
            </div>
            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-success rounded-full" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col">
          <div className="flex border-b border-border overflow-x-auto">
            {["Cover letter", "CV summary", "Email draft"].map((label, i) => (
              <button
                key={label}
                className={`whitespace-nowrap px-4 sm:px-5 py-3.5 text-xs font-semibold tracking-wide border-b-2 -mb-px ${
                  i === 0 ? "border-primary text-primary" : "border-transparent text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5 md:p-6 max-h-120 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
              {`Dear Hiring Manager,

I am excited to apply for this position.

With my experience in React and TypeScript,
I believe I would be a strong fit for your team.`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
