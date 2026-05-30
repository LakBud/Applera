import { Link } from "@tanstack/react-router";
import type { Dashboard } from "../../api/schemas";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface CVApplicationsTabProps {
  applications: Dashboard["applications"];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  generated: "bg-primary/10 text-primary border-primary/20",
  applied: "bg-info/10 text-info border-info/20",
  interviewing: "bg-warning/10 text-warning border-warning/20",
  offered: "bg-success/10 text-success border-success/20",
  rejected: "bg-error/10 text-error border-error/20",
  withdrawn: "bg-error/10 text-error border-error/20",
};

export function CVApplicationsTab({ applications }: CVApplicationsTabProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-tx-muted text-sm">No applications yet with this CV.</p>
        <Link to="/">
          <Button size="sm" className="text-xs font-semibold btn-glow">
            Create your first application →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => (
        <Link key={app._id} to="/applications/$applicationId" params={{ applicationId: app._id }} className="block">
          <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition group">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-tx-body group-hover:text-tx-h1 transition">{app.job_title}</p>
              <p className="text-xs text-tx-muted">{formatDate(app.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-display text-tx-h1">{app.score}%</span>
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  STATUS_COLORS[app.status] ?? STATUS_COLORS.generated
                }`}
              >
                {app.status}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
