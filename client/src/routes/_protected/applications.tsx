import { createFileRoute, Link } from "@tanstack/react-router";
import { useTracker } from "../../api";

export const Route = createFileRoute("/_protected/applications")({
  component: ApplicationsPage,
});

const STATUS_LABELS: Record<string, string> = {
  generated: "Generert",
  applied: "Søkt",
  interviewing: "Intervju",
  offered: "Tilbud",
  rejected: "Avslått",
  withdrawn: "Trukket",
};

const STATUS_COLORS: Record<string, string> = {
  generated: "bg-[#222] text-[#666]",
  applied: "bg-blue-900/30 text-blue-400",
  interviewing: "bg-amber-900/30 text-amber-400",
  offered: "bg-green-900/30 text-green-400",
  rejected: "bg-red-900/30 text-red-400",
  withdrawn: "bg-[#222] text-[#444]",
};

function ApplicationsPage() {
  const cvId = localStorage.getItem("lastCvId") ?? "";
  const { data, isLoading, error } = useTracker(cvId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-[#c9a96e]">Sporing</p>
        <h1 className="font-display text-4xl">Mine søknader</h1>
      </div>

      {isLoading && <div className="text-[#444] text-sm animate-pulse">Laster søknader...</div>}

      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {data?.applications?.length === 0 && (
        <div className="border border-white/5 rounded-lg p-10 text-center space-y-3">
          <p className="text-[#444]">Ingen søknader ennå.</p>
          <Link
            to="/"
            className="inline-block text-sm px-6 py-2.5 bg-[#c9a96e] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4b97e] transition-colors"
          >
            Generer søknad
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {data?.applications?.map((app: any) => (
          <Link
            key={app._id}
            to="/applications/$applicationsId"
            params={{ applicationsId: app._id }}
            className="flex items-center gap-4 bg-[#111] border border-white/5 rounded-lg px-5 py-4 hover:border-[#c9a96e]/20 transition-all group"
          >
            {/* Score ring */}
            <div className="shrink-0 w-12 h-12 rounded-full border-2 border-[#c9a96e]/30 flex items-center justify-center">
              <span className="text-xs font-mono text-[#c9a96e]">{app.match?.score ?? 0}%</span>
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate group-hover:text-[#c9a96e] transition-colors">
                {(app.job as any)?.parsed?.title ?? "Ukjent stilling"}
              </p>
              <p className="text-xs text-[#444]">{new Date(app.createdAt).toLocaleDateString("nb-NO")}</p>
            </div>

            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] ?? STATUS_COLORS.generated}`}>
              {STATUS_LABELS[app.status] ?? app.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
