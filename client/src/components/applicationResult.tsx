// src/components/ApplicationResult.tsx
import { useState } from "react";
import type { CreateApplicationResponse } from "../api";

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

  return (
    <div className="space-y-4">
      {/* Match overview */}
      <div className="bg-[#111] border border-white/5 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-[#555]">Match-score</span>
          <span className="font-mono text-[#c9a96e] text-xl">{application.match?.score ?? 0}%</span>
        </div>
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden mb-4">
          <div
            className="h-full from-[#c9a96e] to-[#d4b97e] rounded-full"
            style={{ width: `${application.match?.score ?? 0}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#444] mb-1.5">Styrker</p>
            <div className="flex flex-wrap gap-1">
              {application.match?.strengths?.map((s) => (
                <span key={s} className="text-xs bg-green-900/20 text-green-400 px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
              {!application.match?.strengths?.length && <span className="text-xs text-[#444]">—</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#444] mb-1.5">Mangler</p>
            <div className="flex flex-wrap gap-1">
              {application.match?.missing_skills?.map((s) => (
                <span key={s} className="text-xs bg-red-900/20 text-red-400 px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
              {!application.match?.missing_skills?.length && <span className="text-xs text-green-400">Ingen mangler!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* CV summary */}
      <ResultCard
        title="CV-sammendrag"
        onCopy={() => copy(application.tailored_cv_summary, "summary")}
        copied={copied === "summary"}
      >
        <p className="text-sm text-[#888] leading-relaxed">{application.tailored_cv_summary}</p>
      </ResultCard>

      {/* Cover letter */}
      <ResultCard title="Søknadsbrev" onCopy={() => copy(application.cover_letter, "letter")} copied={copied === "letter"}>
        <pre className="whitespace-pre-wrap text-sm text-[#aaa] leading-relaxed font-body">{application.cover_letter}</pre>
      </ResultCard>

      {/* Email */}
      <ResultCard
        title="E-post"
        onCopy={() => copy(`Emne: ${application.application_email.subject}\n\n${application.application_email.body}`, "email")}
        copied={copied === "email"}
      >
        <p className="text-xs text-[#555] mb-3">
          Emne: <span className="text-[#888]">{application.application_email?.subject}</span>
        </p>
        <pre className="whitespace-pre-wrap text-sm text-[#aaa] leading-relaxed font-body">
          {application.application_email?.body}
        </pre>
      </ResultCard>
    </div>
  );
}

function ResultCard({
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
    <div className="bg-[#111] border border-white/5 rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-widest text-[#555]">{title}</h3>
        <button onClick={onCopy} className="text-xs text-[#444] hover:text-[#c9a96e] transition-colors">
          {copied ? "Kopiert ✓" : "Kopier"}
        </button>
      </div>
      {children}
    </div>
  );
}
