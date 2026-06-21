import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import Uploader from '@/components/common/generator/Uploader';

import { useCVs } from '../../api';
import { usePinCV } from '../../api/cv/cv.hooks';
import { CVCard } from '../../components/cvs/CVCard';
import { CVCardSkeleton } from '../../components/cvs/CVCardSkeleton';

import { useCVState } from '@/hooks/cv/useCVState';
import type { CVDocument } from '@repo/schemas';

export function CVsPage() {
  const { data: cvs, isLoading } = useCVs();
  const cv = useCVState();

  const { mutate: pinCv, isPending: isPinning } = usePinCV();

  const pinnedCount = cvs?.filter((cv: CVDocument) => cv.pinned).length ?? 0;

  return (
    <>
      <section className="mx-auto max-w-6xl p-8">
        <div className=" flex flex-col space-y-6">
          {!isLoading && cvs?.length === 0 && (
            <EmptyState
              icon={<FileText className="w-7 h-7" />}
              title="No CVs yet"
              description="Create one by using the CV uploader"
            />
          )}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CVCardSkeleton key={i} />)
              : cvs?.map((cv: CVDocument) => (
                  <div key={cv._id} className="animate-cv-card-in">
                    <CVCard
                      cv={cv}
                      onPin={() => pinCv(cv._id)}
                      isPinning={isPinning}
                      canPin={!cv.pinned && pinnedCount >= 5}
                    />
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="border-t p-4 md:p-10">
        <div className="max-w-6xl mx-auto px-0 md:px-8">
          <div className="flex justify-center">
            <div className="w-full md:max-w-lg">
              <Uploader
                key={`cv-${cv.resetKey}`}
                label="CV"
                placeholder="Paste your CV here..."
                uploadFile={cv.uploadCVFile}
                uploadText={cv.uploadCVText}
                onSuccess={(id) => cv.setCvId(id ?? null)}
                getId={(res) => res.cv?._id}
                showCvList
                selectedCvId={cv.cvId}
                onSelectCv={(id) => cv.setCvId(id)}
                onDeselectCv={() => cv.clearCvId()}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
