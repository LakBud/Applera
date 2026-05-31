import { formatDistanceToNow } from "date-fns";
import { Briefcase, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "../components/ui/badge";
import { useApplications } from "../api/hooks/useApplication";
import { STATUS_STYLES } from "../utils/statusStyles";

function RowSkeleton() {
  return (
    <div className="px-4 py-3.5 flex items-center gap-4">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 bg-muted animate-pulse rounded" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-5 w-20 bg-muted animate-pulse rounded" />
    </div>
  );
}

function ApplicationRow({ application }: { application: any }) {
  const navigate = useNavigate();
  const status = STATUS_STYLES[application.status] ?? {
    label: application.status,
    className: "bg-gray-100 text-gray-600",
  };

  const jobTitle = application.job?.parsed?.title ?? "Untitled Role";
  const company = application.job?.parsed?.company ?? application.job?.company ?? "Unknown Company";
  const location = application.job?.parsed?.location ?? application.job?.location ?? null;
  const cvName = application.cv?.parsed?.name ?? "CV";
  const score = application.match?.score;

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3.5 border border-border hover:bg-muted/40 cursor-pointer transition-colors"
      onClick={() => navigate({ to: "/applications/$applicationId", params: { applicationId: application._id } })}
    >
      {/* Left — job info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{jobTitle}</p>
        <p className="text-xs text-muted-foreground truncate">
          {company}
          {location ? ` · ${location}` : ""}
        </p>
      </div>

      {/* Middle — cv + match */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {cvName}
        </span>
        {score !== undefined && (
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {score}%
          </span>
        )}
      </div>

      {/* Right — status + date */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:block text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
        </span>
        <Badge variant="outline" className={`text-xs font-medium ${status.className}`}>
          {status.label}
        </Badge>
      </div>
    </div>
  );
}

function StatusSummary({ applications }: { applications: any[] }) {
  const counts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total", value: applications.length },
    { label: "Applied", value: counts.applied ?? 0 },
    { label: "Interviewing", value: counts.interviewing ?? 0 },
    { label: "Offered", value: counts.offered ?? 0 },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-border border border-border mb-6">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3 text-center">
          <p className="text-xl font-semibold">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function ApplicationsPage() {
  const { data: applications, isLoading, isError } = useApplications();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track every application in one place</p>
        </div>
      </div>

      {isLoading && (
        <div className="border border-border divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <RowSkeleton />
                <RowSkeleton />
              </div>
              <RowSkeleton />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-border px-4 py-16 text-center text-sm text-muted-foreground">
          Failed to load applications. Please try again.
        </div>
      )}

      {applications && applications.length === 0 && (
        <div className="border border-border px-4 py-20 text-center text-muted-foreground">
          <Briefcase className="w-7 h-7 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No applications yet.</p>
          <p className="text-xs mt-1">Create one by matching a CV to a job.</p>
        </div>
      )}

      {applications && applications.length > 0 && (
        <>
          <StatusSummary applications={applications} />
          <div className="border border-border divide-y divide-border">
            {applications.map((app) => (
              <ApplicationRow key={app._id} application={app} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
