import { useState } from "react";
import { useCV, useCVDashboard } from "../api";
import { Route } from "../routes/__protected/cvs/$cvId";
import { useCVSuccessRate } from "../hooks/cv-id/useCVSuccessRate";
import { useCVCompleteness } from "../hooks/cv-id/useCVCompleteness";
import { CVHero } from "../components/cv-detail/sections/CVHero";
import { CVStatsSection } from "../components/cv-detail/sections/CVStatsSection";
import { CVPdfDrawer } from "../components/cv-detail/CVPdfDrawer";
import CVContent from "../components/cv-detail/CVContent";
import { Separator } from "../components/ui/separator";

export function CVDetailPage() {
  const { cvId } = Route.useParams();
  const [pdfOpen, setPdfOpen] = useState(false);

  const { data: cv, isLoading: cvLoading, error: cvError } = useCV(cvId);
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useCVDashboard(cvId);

  const { completeness, missing } = useCVCompleteness(cv);
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

        <Separator />

        <CVStatsSection
          successRate={successRate}
          totalApplications={dashboard.total}
          avgScore={dashboard.average_score}
          bestScore={dashboard.highest_score}
          completeness={completeness}
          missing={missing}
        />

        {/* Main tabs */}
        <CVContent cv={cv} dashboard={dashboard} />
      </div>

      {/* PDF drawer */}
      <CVPdfDrawer open={pdfOpen} onClose={() => setPdfOpen(false)} pdfUrl={cv.pdfUrl} previewImageUrl={cv.previewImageUrl} />
    </div>
  );
}
