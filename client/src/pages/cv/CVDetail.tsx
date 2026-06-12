import { useState } from 'react';
import { useCV, useCVDashboard } from '../../api';
import { Route } from '../../routes/__protected/cvs/$cvId';
import { useCVSuccessRate } from '../../hooks/cv-id/useCVSuccessRate';
import { useCVCompleteness } from '../../hooks/cv-id/useCVCompleteness';
import { CVStatsSection } from '../../components/cv-detail/sections/CVStats';
import { CVPdfDrawer } from '../../components/cv-detail/CVPdfDrawer';
import { Loader } from '../../components/common/Loader';
import CVTabsSection from '../../components/cv-detail/sections/CVTabs';
import { CVHeaderSection } from '../../components/cv-detail/sections/CVHeader';
import { getCVPdfUrl } from '../../utils/cv-id/url';

export function CVDetailPage() {
  const { cvId } = Route.useParams();
  const [pdfOpen, setPdfOpen] = useState(false);

  const { data: cv, isLoading: cvLoading, error: cvError } = useCV(cvId);
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useCVDashboard(cvId);

  const { completeness, missing } = useCVCompleteness(cv);
  const { successRate } = useCVSuccessRate(dashboard);

  const loading = cvLoading || dashLoading;

  if (loading) {
    return <Loader size="md" fullScreen text="Loading CV…" />;
  }

  if (!cv || !dashboard || cvError || dashError) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-red-500">Failed to load CV.</p>
      </div>
    );
  }

  const pdfUrl = getCVPdfUrl(cv._id);
  const previewUrl = cv.previewUrl;
  const openPdf = () => setPdfOpen(true);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-bg animate-fade-in">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b pb-10">
          <CVHeaderSection
            name={cv.parsed.name}
            seniority={cv.parsed.seniority_level}
            updatedAtLabel={`Updated ${formatDate(cv.updatedAt ?? '')}`}
            showPdf={!!pdfUrl}
            onOpenPdf={openPdf}
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
        <CVTabsSection cv={cv} dashboard={dashboard} isLoading={loading} />
      </div>

      {/* PDF drawer */}
      <CVPdfDrawer
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        pdfUrl={pdfUrl}
        previewUrl={previewUrl}
        isLoading={loading}
      />
    </div>
  );
}
