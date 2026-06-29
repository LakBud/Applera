import Uploader from '@/components/common/generator/Uploader';

import { useHomeState } from '../../../hooks/home/useHomeState';
import { Loader } from '../../common/Loader';
import { Button } from '../../ui/button';

export type HomeState = ReturnType<typeof useHomeState>;

type Props = {
  state: HomeState;
};

export default function GeneratorSection({ state }: Props) {
  const {
    cvId,
    result,
    isPending,
    uploadCVFile,
    uploadCVText,
    uploadJobFile,
    uploadJobText,
    setCvId,
    setJobId,
    handleGenerate,
    canGenerate,
    clearCvId,
    resetKey,
  } = state;

  const isLocked = !!result;

  return (
    <div className="space-y-6">
      <div
        className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${
          isLocked ? 'grayscale opacity-40 pointer-events-none select-none' : ''
        }`}
      >
        {/* CV */}
        <div className="space-y-2 ">
          <Uploader
            key={`cv-${resetKey}`}
            label="CV"
            placeholder="Paste your CV here..."
            uploadFile={uploadCVFile}
            uploadText={uploadCVText}
            onSuccess={(id) => setCvId(id ?? null)}
            getId={(res) => res.cv?._id}
            showCvList
            selectedCvId={cvId}
            onSelectCv={(id) => setCvId(id)}
            onDeselectCv={() => clearCvId()}
          />
        </div>

        {/* Job */}
        <div className="space-y-2">
          <Uploader
            key={`job-${resetKey}`}
            label="Job listing"
            placeholder="Paste the job listing here..."
            uploadFile={uploadJobFile}
            uploadText={uploadJobText}
            onSuccess={(id) => setJobId(id ?? null)}
            getId={(res) => res.job?._id}
          />
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {!isLocked ? (
          <>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="px-8 py-6 text-sm font-semibold btn-primary text-white/70 hover:bg-[#1fa028]/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? <Loader size="sm" text="Generating…" /> : 'Generate application'}
            </Button>
            {/* Explains the disabled state instead of leaving the user guessing */}
            {!canGenerate && !isPending && (
              <span className="text-xs text-caption pt-2">
                Upload or paste both a CV and job listing to continue
              </span>
            )}
          </>
        ) : (
          <Button
            type="button"
            onClick={state.handleReset}
            variant="outline"
            className="px-8 py-6 cursor-pointer bg-white/70 text-sm font-semibold border-border text-green-800 hover:bg-[#1fa028]/5 transition-all"
          >
            New application
          </Button>
        )}
      </div>
    </div>
  );
}
