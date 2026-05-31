import { ArrowLeft, Briefcase, FileText, MapPin, TrendingUp, AlertCircle, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "../routes/__protected/applications/$applicationId";
import { useApplication, useUpdateApplicationStatus } from "../api";
import { Button } from "../components/ui/button";
import { useDeleteApplication } from "../api/hooks/useApplication";
import { STATUS_STYLES } from "../utils/statusStyles";
import { InterviewPrepSection } from "../components/application-id/interviewPrepSection";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

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

export function ApplicationIdPage() {
  const { applicationId } = Route.useParams();
  const navigate = useNavigate();
  const { data: application, isLoading, isError } = useApplication(applicationId);
  const { mutate: deleteApp, isPending: isDeleting } = useDeleteApplication();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateApplicationStatus();

  const handleDelete = () => {
    deleteApp(applicationId, {
      onSuccess: () => navigate({ to: "/applications" }),
    });
  };

  const handleStatusChange = (status: string) => {
    updateStatus({ id: applicationId, status });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="border border-border px-4 py-16 text-center text-sm text-muted-foreground">
          Failed to load application. Please try again.
        </div>
      </div>
    );
  }

  const cv = typeof application.cv === "object" ? application.cv : null;
  const job = typeof application.job === "object" ? application.job : null;
  const { match } = application;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate({ to: "/applications" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Applications
        </button>

        <div className="flex items-center gap-2">
          <select
            value={application.status}
            disabled={isUpdatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs border border-border bg-background px-2 py-1.5 rounded-sm focus:outline-none disabled:opacity-50"
          >
            {["generated", "applied", "interviewing", "offered", "rejected", "withdrawn"].map((s) => (
              <option key={s} value={s}>
                {STATUS_STYLES[s]?.label ?? s}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Job */}
      <Section title="Job listing">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
            <p className="text-sm font-medium">{job?.parsed?.title ?? "Untitled Role"}</p>
          </div>
          {(job?.company || job?.parsed?.title) && <p className="text-xs text-muted-foreground pl-6">{job?.company}</p>}
          {job?.location && (
            <div className="flex items-center gap-2 pl-6">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{job.location}</p>
            </div>
          )}
        </div>

        {job?.parsed?.required_skills && job.parsed.required_skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.parsed.required_skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 border border-border rounded-sm bg-muted/40">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job?.parsed?.responsibilities && job.parsed.responsibilities.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Responsibilities</p>
            <ul className="space-y-1">
              {job.parsed.responsibilities.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="mt-1 shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* CV */}
      <Section title="CV">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium">{cv?.parsed?.name ?? "CV"}</p>
        </div>
        {cv?.parsed?.email && <p className="text-xs text-muted-foreground pl-6 mt-0.5">{cv.parsed.email}</p>}

        {cv?.parsed?.skills && cv.parsed.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {cv.parsed.skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 border border-border rounded-sm bg-muted/40">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Match */}
      <Section title="Match">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{match.score}% match</span>
          </div>
          <span className="text-xs text-muted-foreground capitalize">{match.confidence} confidence</span>
        </div>

        {/* Score bar */}
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-foreground rounded-full transition-all"
            style={{ width: `${Math.round(match.score * 100)}%` }}
          />
        </div>

        {match.strengths.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xs font-medium text-green-700">Strengths</p>
            </div>
            <ul className="space-y-1">
              {match.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="mt-1 shrink-0">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {match.missing_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-xs font-medium text-amber-700">Missing skills</p>
            </div>
            <ul className="space-y-1">
              {match.missing_skills.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="mt-1 shrink-0">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Cover letter */}
      <Section title="Cover letter">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{application.cover_letter}</p>
      </Section>

      {/* Email */}
      <Section title="Application email">
        <p className="text-xs text-muted-foreground mb-1">Subject</p>
        <p className="text-sm font-medium mb-4">{application.application_email.subject}</p>
        <p className="text-xs text-muted-foreground mb-1">Body</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{application.application_email.body}</p>
      </Section>

      <InterviewPrepSection applicationId={applicationId} />
    </div>
  );
}
