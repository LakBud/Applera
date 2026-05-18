import ApplicationResult from "../ApplicationResult";
import { Button } from "../../ui/button";
import type { HomeState } from "./GeneratorSection";

type Props = {
  state: HomeState;
};

export default function ApplicationResultSection({ state }: Props) {
  const { result, isPending, handleReset } = state;

  return (
    <section className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        {/* Section header */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-overline">Output</span>
            <h2 className="font-display text-3xl text-h2">Your application</h2>
          </div>

          {result && (
            <Button type="button" onClick={handleReset} variant="outline" className="text-xs px-3 py-1.5 mb-1">
              ← New application
            </Button>
          )}
        </div>

        {/* Result / empty / loading state */}
        {result ? (
          <ApplicationResult data={result} />
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-muted">
              <div className="w-2.5 h-2.5 rounded-full bg-error/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/30" />
              <span className="ml-2 text-xs text-caption">{isPending ? "Generating..." : "Waiting for input"}</span>
            </div>

            <div className="grid md:grid-cols-[300px_1fr]">
              {/* Left panel skeleton */}
              <div className="border-b md:border-b-0 md:border-r border-border p-6 space-y-6">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="relative w-28 h-28 rounded-full border-4 border-border bg-surface-muted flex flex-col items-center justify-center">
                    {isPending ? (
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span className="text-3xl font-mono font-bold text-border">—</span>
                        <span className="text-[10px] uppercase tracking-widest text-label mt-1">match</span>
                      </>
                    )}
                  </div>
                  <div className="h-3 w-24 rounded-full bg-surface-muted" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[48, 64, 52].map((w, i) => (
                      <div
                        key={i}
                        className={`h-6 rounded-lg bg-surface-muted ${isPending ? "animate-pulse" : ""}`}
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-label">Gaps</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[56, 44].map((w, i) => (
                      <div
                        key={i}
                        className={`h-6 rounded-lg bg-surface-muted ${isPending ? "animate-pulse" : ""}`}
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-caption">
                    <span>Fit score</span>
                    <span>—</span>
                  </div>
                  <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-border transition-all ${isPending ? "animate-pulse w-1/3" : "w-0"}`}
                    />
                  </div>
                </div>
              </div>

              {/* Right panel skeleton */}
              <div className="flex flex-col">
                <div className="flex border-b border-border">
                  {["Cover letter", "CV summary", "Email draft"].map((label, i) => (
                    <div
                      key={label}
                      className={`px-5 py-3.5 text-xs font-semibold tracking-wide text-label border-b-2 border-transparent ${
                        i === 0 ? "text-secondary" : ""
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="p-6 space-y-3 flex-1">
                  {isPending ? (
                    <>
                      {[100, 92, 78, 95, 60, 84, 70].map((w, i) => (
                        <div
                          key={i}
                          className="h-3 rounded-full bg-surface-muted animate-pulse"
                          style={{
                            width: `${w}%`,
                            animationDelay: `${i * 80}ms`,
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {[100, 92, 78, 95, 60, 84, 70].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-surface-muted opacity-40" style={{ width: `${w}%` }} />
                      ))}
                      <p className="pt-4 text-xs text-caption text-center">
                        Upload your CV and a job listing above to generate your application.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
