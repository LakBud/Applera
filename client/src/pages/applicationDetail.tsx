import { ArrowLeft, FileText, MapPin, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "../routes/__protected/applications/$applicationId";
import { useApplication, useUpdateApplicationStatus } from "../api";
import { Button } from "../components/ui/button";
import { useDeleteApplication } from "../api/hooks/useApplication";
import { STATUS_STYLES } from "../utils/statusStyles";
import { InterviewPrepSection } from "../components/application-id/interviewPrepSection";
import ApplicationResult from "../components/home/ApplicationResult";
import { Loader } from "../components/common/Loader";
import { Section } from "../components/common/Section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function ApplicationDetailPage() {
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
    return <Loader fullScreen />;
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button
          onClick={() => navigate({ to: "/applications" })}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Applications
        </Button>

        <div className="flex items-center gap-2">
          <Select value={application.status} disabled={isUpdatingStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="text-xs h-8 w-36 bg-white border-green-200 text-green-800 focus:ring-green-500 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-green-100 animate-in fade-in-0 zoom-in-95 duration-100">
              {["generated", "applied", "interviewing", "offered", "rejected", "withdrawn"].map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="text-xs text-green-800 focus:bg-green-50 focus:text-green-900 cursor-pointer transition-colors duration-100"
                >
                  {STATUS_STYLES[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {isDeleting ? <Loader size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      <ApplicationResult data={{ application }} />

      {/* Job details */}
      <Section
        title="Job listing"
        action={
          cv?._id ? (
            <span
              onClick={() => navigate({ to: "/cvs/$cvId", params: { cvId: cv._id } })}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <FileText className="w-3 h-3" />
              {cv?.parsed?.name ?? "View CV"}
              <ArrowRight className="w-3 h-3" />
            </span>
          ) : null
        }
      >
        <div className="space-y-1 mb-4">
          <p className="text-sm font-medium">{job?.parsed?.title ?? "Untitled Role"}</p>
          {job?.company && <p className="text-xs text-muted-foreground">{job.company}</p>}
          {job?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{job.location}</p>
            </div>
          )}
          {job?.parsed?.seniority && (
            <span className="inline-block text-xs px-2 py-0.5 bg-muted rounded-sm">{job.parsed.seniority}</span>
          )}
        </div>

        {job?.parsed?.required_skills && job.parsed.required_skills.length > 0 && (
          <div className="mb-4">
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
          <div>
            <p className="text-xs text-muted-foreground mb-2">Responsibilities</p>
            <ul className="space-y-1">
              {job.parsed.responsibilities.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="mt-0.5 shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <InterviewPrepSection applicationId={applicationId} />
    </div>
  );
}
