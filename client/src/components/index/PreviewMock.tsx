export default function PreviewMock() {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm w-180">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/30" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/30" />
      </div>

      <div className="grid md:grid-cols-[300px_1fr]">
        {/* Left panel */}
        <div className="border-b md:border-b-0 md:border-r border-border p-6 space-y-6">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative w-28 h-28 rounded-full border-4 border-border bg-surface-muted flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-h2">87</span>
              <span className="text-[10px] uppercase tracking-widest text-label mt-1">match</span>
            </div>
            <div className="h-3 w-24 rounded-full bg-surface-muted" />
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {["React", "TypeScript", "API usage"].map((item) => (
                <span key={item} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-secondary border border-border">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {["Testing", "System design"].map((item) => (
                <span key={item} className="text-xs px-2 py-1 rounded-lg bg-surface-muted text-caption border border-border">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-caption">
              <span>Fit score</span>
              <span>87%</span>
            </div>
            <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-border rounded-full" />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {["Cover letter", "CV summary", "Email draft"].map((label, i) => (
              <div
                key={label}
                className={`px-5 py-3.5 text-xs font-semibold tracking-wide border-b-2 ${
                  i === 0 ? "text-secondary border-primary" : "text-label border-transparent"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 space-y-3 flex-1">
            {[
              "Dear Hiring Manager,",
              "I am excited to apply for this position...",
              "With my experience in React and TypeScript...",
              "I believe I would be a strong fit...",
            ].map((line, i) => (
              <div key={line} className="h-3 bg-surface-muted rounded-full" style={{ width: `${100 - i * 10}%` }} />
            ))}

            <p className="pt-4 text-xs text-caption text-center">This is a preview of your generated application output.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
