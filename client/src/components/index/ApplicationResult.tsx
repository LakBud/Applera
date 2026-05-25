import { useState } from "react";
import type { CreateApplicationResponse } from "../../api/schemas";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

type Props = {
  data: CreateApplicationResponse;
};

export default function ApplicationResult({ data }: Props) {
  const { application } = data;
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"letter" | "summary" | "email">("letter");

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const score = application.match?.score ?? 0;
  const scoreColor =
    score >= 80
      ? "text-tx-h1" // #1fa028 — bright green (high)
      : score >= 60
        ? "text-tx-h3" // #166534 — mid green
        : "text-tx-secondary"; // #3d5a45 — dark muted green (low)

  const barColor = score >= 80 ? "bg-[#1fa028]" : score >= 60 ? "bg-[#166534]" : "bg-[#3d5a45]";

  const scoreLabel = score >= 80 ? "Strong match" : score >= 60 ? "Decent match" : "Weak match";

  const activeContent = {
    summary: application.tailored_cv_summary,
    letter: application.cover_letter,
    email: `Subject: ${application.application_email?.subject}\n\n${application.application_email?.body}`,
  }[activeTab];

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg bg-white/70">
      {/* ── Window chrome bar ── */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-caption">Application result</span>
      </div>

      <div className="grid md:grid-cols-[300px_1fr]">
        {/* ══════════════════════════════════
            LEFT PANEL — score + keywords
        ══════════════════════════════════ */}
        <div className="border-b md:border-b-0 md:border-r border-border p-6 space-y-6">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-primary/20 bg-primary/5">
              <span className={`text-4xl font-bold font-mono leading-none ${scoreColor}`}>{score}</span>
              <span className="text-[10px] uppercase tracking-widest text-label mt-1">match</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
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
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-h2">{scoreLabel}</p>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {application.match?.strengths?.length ? (
                application.match.strengths.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
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
              {application.match?.missing_skills?.length ? (
                application.match.missing_skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-lg text-green-900 border border-error/20">
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
              <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            RIGHT PANEL — TABS
        ══════════════════════════════════ */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex flex-col">
          {/* Tab bar */}
          <div className="flex items-center border-b border-border px-0">
            <TabsList className="h-auto bg-transparent gap-0 p-0">
              <TabsTrigger
                value="letter"
                className="px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent data-[state=active]:border-b-green-800 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition"
              >
                Cover letter
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent  data-[state=active]:border-b-green-800 data-[state=active]:text-green-800 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition"
              >
                CV summary
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="px-5 py-3.5 text-xs font-semibold tracking-wide rounded-none border-b-2 border-transparent  data-[state=active]:border-b-green-800 data-[state=active]:text-green-800  data-[state=active]:shadow-none data-[state=active]:bg-transparent text-secondary hover:text-tx-h2 transition"
              >
                Email draft
              </TabsTrigger>
            </TabsList>

            {/* Copy button */}
            <div className="ml-auto flex items-center px-4">
              <Button
                type="button"
                onClick={() => copy(activeContent, activeTab)}
                className="text-xs text-secondary hover:text-h1 transition px-3 py-1.5"
              >
                {copied === activeTab ? "Copied ✓" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Content */}
          <TabsContent value="letter" className="flex-1 p-6 overflow-auto max-h-120 mt-0">
            <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">{application.cover_letter}</pre>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 p-6 overflow-auto max-h-120 mt-0">
            <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">{application.tailored_cv_summary}</pre>
          </TabsContent>

          <TabsContent value="email" className="flex-1 p-6 overflow-auto max-h-120 mt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <span className="text-xs text-caption w-14">Subject</span>
                <span className="text-sm text-tx-body font-medium">{application.application_email?.subject}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-tx-body leading-relaxed">
                {application.application_email?.body}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
