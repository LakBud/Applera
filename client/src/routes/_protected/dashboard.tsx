// src/routes/_protected/dashboard.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useDashboard } from "../../api";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  generated: "bg-[#333] text-[#888]",
  applied: "bg-blue-900/40 text-blue-400",
  interviewing: "bg-amber-900/40 text-amber-400",
  offered: "bg-green-900/40 text-green-400",
  rejected: "bg-red-900/40 text-red-400",
  withdrawn: "bg-[#333] text-[#555]",
};

function DashboardPage() {
  const { user } = useUser();

  // Dashboard requires a cvId — show prompt if none stored
  const cvId = localStorage.getItem("lastCvId");
  const { data, isLoading, error } = useDashboard(cvId ?? "");

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-[#c9a96e]">Oversikt</p>
        <h1 className="font-display text-4xl">Hei, {user?.firstName ?? "der"}.</h1>
      </div>

      {!cvId && (
        <div className="border border-white/5 rounded-lg p-8 text-center space-y-3">
          <p className="text-[#555]">Ingen søknader ennå.</p>
          <Link
            to="/"
            className="inline-block text-sm px-6 py-2.5 bg-[#c9a96e] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4b97e] transition-colors"
          >
            Generer din første søknad
          </Link>
        </div>
      )}

      {isLoading && <div className="text-[#444] text-sm animate-pulse">Laster dashboard...</div>}

      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {data && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Søknader", value: data.total },
              { label: "Gjennomsnitts-match", value: `${data.average_score}%` },
              { label: "Beste match", value: `${data.highest_score}%` },
              { label: "Intervjuer", value: data.status_breakdown?.interviewing ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111] border border-white/5 rounded-lg p-5 space-y-1">
                <p className="text-xs text-[#444] tracking-wide">{label}</p>
                <p className="font-display text-3xl text-[#e8e4dc]">{value}</p>
              </div>
            ))}
          </div>

          {/* Applications list */}
          <div className="space-y-3">
            <h2 className="font-display text-xl">Søknader</h2>
            {data.applications.map((app: any) => (
              <Link
                key={app._id}
                to="/applications/$applicationsId"
                params={{ applicationsId: app._id }}
                className="flex items-center justify-between bg-[#111] border border-white/5 rounded-lg px-5 py-4 hover:border-white/10 transition-colors group"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium group-hover:text-[#c9a96e] transition-colors">{app.job_title}</p>
                  <p className="text-xs text-[#444]">{new Date(app.createdAt).toLocaleDateString("nb-NO")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#c9a96e] font-mono">{app.score}%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status] ?? STATUS_COLORS.generated}`}>
                    {app.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
