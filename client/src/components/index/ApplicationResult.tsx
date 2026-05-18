import { useState } from "react";
import type { CreateApplicationResponse } from "../../api";
import { Button } from "../ui/button";

type Props = {
  data: CreateApplicationResponse;
};

export default function ApplicationResult({ data }: Props) {
  const { application } = data;
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const score = application.match?.score ?? 0;

  return (
    <div className="space-y-6">
      {/* ================= MATCH OVERVIEW ================= */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-overline">Match score</span>
          <span className="text-h1 font-mono text-xl">{score}%</span>
        </div>

        <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${score}%` }} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          {/* Strengths */}
          <div>
            <p className="text-caption mb-2">Strengths</p>
            <div className="flex flex-wrap gap-2">
              {application.match?.strengths?.length ? (
                application.match.strengths.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-h1 border border-primary/20">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-caption">—</span>
              )}
            </div>
          </div>

          {/* Missing */}
          <div>
            <p className="text-caption mb-2">Gaps</p>
            <div className="flex flex-wrap gap-2">
              {application.match?.missing_skills?.length ? (
                application.match.missing_skills.map((s) => (
                  <span key={s} className="text-xs px-2 py-1 rounded-lg bg-error/10 text-error border border-error/20">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-primary text-xs">Perfect match</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= CV SUMMARY ================= */}
      <Section title="CV summary" onCopy={() => copy(application.tailored_cv_summary, "summary")} copied={copied === "summary"}>
        <p className="text-body leading-relaxed">{application.tailored_cv_summary}</p>
      </Section>

      {/* ================= COVER LETTER ================= */}
      <Section title="Cover letter" onCopy={() => copy(application.cover_letter, "letter")} copied={copied === "letter"}>
        <pre className="whitespace-pre-wrap text-body leading-relaxed">{application.cover_letter}</pre>
      </Section>

      {/* ================= EMAIL ================= */}
      <Section
        title="Email draft"
        onCopy={() => copy(`Subject: ${application.application_email.subject}\n\n${application.application_email.body}`, "email")}
        copied={copied === "email"}
      >
        <p className="text-caption mb-2">
          Subject: <span className="text-body">{application.application_email?.subject}</span>
        </p>

        <pre className="whitespace-pre-wrap text-body leading-relaxed">{application.application_email?.body}</pre>
      </Section>
    </div>
  );
}

/* ================= SECTION COMPONENT ================= */

function Section({
  title,
  children,
  onCopy,
  copied,
}: {
  title: string;
  children: React.ReactNode;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-overline">{title}</span>

        <Button type="button" onClick={onCopy} className="text-xs text-secondary hover:text-h1 transition">
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>

      {children}
    </div>
  );
}
