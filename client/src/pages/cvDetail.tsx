import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCV, useCVDashboard } from "../api";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Route } from "../routes/__protected/cvs/$cvId";
import { useCVSuccessRate } from "../hooks/cv-id/useCVSuccessRate";
import { useCVCompleteness } from "../hooks/cv-id/useCVCompleteness";
import { CVHero } from "../components/cv-detail/sections/CVHero";
import { CVStatsSection } from "../components/cv-detail/sections/CVStatsSection";

const STATUS_COLORS: Record<string, string> = {
  generated: "bg-muted text-tx-muted",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-amber-100 text-amber-700",
  offered: "bg-primary/10 text-tx-h1",
  rejected: "bg-red-100 text-red-600",
  withdrawn: "bg-muted text-tx-muted",
};

export function CVDetailPage() {
  const { cvId } = Route.useParams();
  const [pdfOpen, setPdfOpen] = useState(false);

  const { data: cv, isLoading: cvLoading, error: cvError } = useCV(cvId);
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useCVDashboard(cvId);

  // ── Completeness ────────────────────────────────────────────────
  const { completeness, missing } = useCVCompleteness(cv);

  // ── Success rate ────────────────────────────────────────────────
  const { successRate } = useCVSuccessRate(dashboard);

  const loading = cvLoading || dashLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="space-y-3 text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-tx-muted">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (!cv || !dashboard || cvError || dashError) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-red-500">Failed to load CV.</p>
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-bg animate-fade-in">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b pb-10">
          <CVHero
            name={cv.parsed.name}
            seniority={cv.parsed.seniority_level}
            updatedAtLabel={`Updated ${formatDate(cv.updatedAt ?? "")}`}
            showPdf={!!cv.pdfUrl}
            onOpenPdf={() => setPdfOpen(true)}
          />
        </div>

        <CVStatsSection
          successRate={successRate}
          totalApplications={dashboard.total}
          avgScore={dashboard.average_score}
          bestScore={dashboard.highest_score}
          completeness={completeness}
          missing={missing}
        />

        {/* Main tabs */}
        <Tabs defaultValue="content">
          <TabsList className="bg-surface-muted rounded-lg p-1 w-full justify-start gap-1 h-auto">
            <TabsTrigger
              value="content"
              className="rounded-md text-xs font-semibold px-4 py-2 data-[state=active]:bg-surface data-[state=active]:text-tx-h1 data-[state=active]:shadow-sm"
            >
              CV Content
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-md text-xs font-semibold px-4 py-2 data-[state=active]:bg-surface data-[state=active]:text-tx-h1 data-[state=active]:shadow-sm"
            >
              Applications
              {dashboard.total > 0 && (
                <span className="ml-2 bg-primary/10 text-tx-h1 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {dashboard.total}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* CV Content */}
          <TabsContent value="content" className="mt-6 space-y-4">
            {cv.parsed.summary && (
              <Section title="Summary">
                <p className="text-sm text-tx-body leading-relaxed">{cv.parsed.summary}</p>
              </Section>
            )}

            {cv.parsed.skills.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {cv.parsed.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-surface-muted border border-primary/10 px-3 py-1 text-xs text-tx-secondary font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {cv.parsed.experience.length > 0 && (
              <Section title="Experience">
                <div className="space-y-4">
                  {cv.parsed.experience.map((exp, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        {i < cv.parsed.experience.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-tx-h3">{exp.title || "Untitled role"}</p>
                        <p className="text-xs text-tx-muted mt-0.5">{exp.company}</p>
                        {exp.highlights?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.highlights.map((h, j) => (
                              <li key={j} className="text-xs text-tx-secondary flex gap-2">
                                <span className="text-primary mt-0.5">·</span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {cv.parsed.education.length > 0 && (
              <Section title="Education">
                <div className="space-y-3">
                  {cv.parsed.education.map((edu, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-tx-body">{edu.title}</p>
                        <p className="text-xs text-tx-muted">{edu.school}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {cv.parsed.projects && cv.parsed.projects.length > 0 && (
              <Section title="Projects">
                <div className="space-y-4">
                  {cv.parsed.projects.map((project, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-tx-h3">{project.name}</p>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-tx-muted hover:text-tx-h1 transition"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                      {project.description && <p className="text-xs text-tx-secondary leading-relaxed">{project.description}</p>}
                      {project.tech && project.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded bg-surface-muted border border-primary/10 text-tx-muted"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {!cv.parsed.summary && !cv.parsed.skills.length && !cv.parsed.experience.length && !cv.parsed.projects?.length && (
              <div className="text-center py-12 text-tx-muted text-sm">No content extracted from this CV yet.</div>
            )}
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications" className="mt-6">
            {dashboard.applications.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <p className="text-tx-muted text-sm">No applications yet with this CV.</p>
                <Link to="/">
                  <Button size="sm" className="text-xs font-semibold btn-glow">
                    Create your first application →
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard.applications.map((app) => (
                  <Link key={app._id} to="/applications/$applicationId" params={{ applicationId: app._id }} className="block">
                    <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-tx-body group-hover:text-tx-h1 transition">{app.job_title}</p>
                        <p className="text-xs text-tx-muted">{formatDate(app.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-display text-tx-h1">{app.score}%</span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[app.status] ?? STATUS_COLORS.generated}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* PDF drawer */}
      {pdfOpen && cv.pdfUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setPdfOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl overflow-hidden shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <p className="text-sm font-semibold text-tx-body">CV Preview</p>
              <button onClick={() => setPdfOpen(false)} className="text-tx-muted hover:text-tx-body transition text-xs">
                Close ✕
              </button>
            </div>
            <div className="overflow-auto flex-1">
              <img src={cv.previewImageUrl ?? cv.pdfUrl} alt="CV preview" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl shadow-sm border border-border bg-surface">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold text-tx-muted uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
