import { createFileRoute } from "@tanstack/react-router";
import { useTracker, useUpdateApplicationStatus } from "../../api";
import { useState } from "react";
import { useGenerateInterviewPrep } from "../../api/hooks/useInterviewPrep";

export const Route = createFileRoute("/_protected/applications/$applicationsId")({
  component: ApplicationDetailPage,
});

const STATUSES = ["generated", "applied", "interviewing", "offered", "rejected", "withdrawn"] as const;

const STATUS_LABELS: Record<string, string> = {
  generated: "Generert",
  applied: "Søkt",
  interviewing: "Intervju",
  offered: "Tilbud",
  rejected: "Avslått",
  withdrawn: "Trukket",
};

function ApplicationDetailPage() {
  const { applicationsId } = Route.useParams();

  const [activeTab, setActiveTab] = useState<"søknad" | "intervju">("søknad");

  // ── DATA ─────────────────────────────
  const { data, isLoading } = useTracker(applicationsId);
  const app = (data as any)?.application;

  // ── MUTATIONS ────────────────────────
  const { mutate: updateStatus } = useUpdateApplicationStatus();
  const { mutate: generatePrep, isPending: prepLoading } = useGenerateInterviewPrep();

  if (isLoading) return <div className="max-w-4xl mx-auto px-6 py-12 text-[#444] text-sm animate-pulse">Laster søknad...</div>;

  if (!app) return <div className="max-w-4xl mx-auto px-6 py-12 text-[#555]">Søknad ikke funnet.</div>;

  const cvId = app.cv?._id; // ✅ NOW SAFE (after app exists)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-[#c9a96e]">Søknad</p>
        <h1 className="font-display text-4xl">{app.job?.parsed?.title ?? "Søknad"}</h1>
        <p className="text-[#444] text-sm">{new Date(app.createdAt).toLocaleDateString("nb-NO")}</p>
      </div>

      {/* MATCH */}
      <div className="bg-[#111] border border-white/5 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#555] uppercase tracking-widest">Match-score</span>
          <span className="font-mono text-[#c9a96e] text-lg">{app.match?.score ?? 0}%</span>
        </div>
      </div>

      {/* STATUS */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() =>
              updateStatus({
                id: app._id,
                cvId,
                status: s,
              })
            }
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              app.status === s
                ? "border-[#c9a96e] text-[#c9a96e] bg-[#c9a96e]/10"
                : "border-white/5 text-[#555] hover:border-white/10 hover:text-[#888]"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* TABS */}
      <div className="flex border-b border-white/5">
        {(["søknad", "intervju"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm capitalize transition-colors ${
              activeTab === tab ? "text-[#c9a96e] border-b border-[#c9a96e]" : "text-[#444] hover:text-[#888]"
            }`}
          >
            {tab === "søknad" ? "Søknad" : "Intervjuforberedelse"}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "søknad" && (
        <div className="space-y-6">
          <Section title="CV-sammendrag">
            <p className="text-sm text-[#888]">{app.tailored_cv_summary}</p>
          </Section>

          <Section title="Søknadsbrev">
            <pre className="whitespace-pre-wrap text-sm text-[#aaa]">{app.cover_letter}</pre>
          </Section>
        </div>
      )}

      {activeTab === "intervju" && (
        <div className="space-y-4">
          {!app.interview_prep && (
            <button
              onClick={() => generatePrep(app._id)}
              disabled={prepLoading}
              className="px-6 py-2.5 bg-[#c9a96e] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4b97e] transition-colors disabled:opacity-40"
            >
              {prepLoading ? "Genererer..." : "Generer intervjuforberedelse"}
            </button>
          )}

          {app.interview_prep?.questions?.map((q: any, i: number) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-lg p-5">
              <p className="text-sm">{q.question}</p>
              <p className="text-xs text-[#555]">{q.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-lg p-6">
      <h3 className="text-xs uppercase text-[#555] mb-3">{title}</h3>
      {children}
    </div>
  );
}
