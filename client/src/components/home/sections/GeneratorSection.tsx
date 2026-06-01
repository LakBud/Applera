import { useHomeState } from "../../../hooks/useHomeState";
import { Loader } from "../../common/Loader";
import { Button } from "../../ui/button";
import Uploader from "../generator/Uploader";

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
      {/* INPUTS (locked when result exists) */}
      <div className={`grid md:grid-cols-2 gap-6 transition-all ${isLocked ? "grayscale opacity-50 pointer-events-none" : ""}`}>
        {/* CV */}
        <div className="space-y-2">
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
      <div className="flex justify-center pt-2">
        {!isLocked ? (
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-10 py-6 text-sm font-semibold border-border btn-primary text-white hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader /> Generating…
              </span>
            ) : (
              "Generate application"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={state.handleReset}
            variant="outline"
            className="px-10 py-6 text-sm font-semibold border-border btn-primary text-white hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            New application
          </Button>
        )}
      </div>
    </div>
  );
}
