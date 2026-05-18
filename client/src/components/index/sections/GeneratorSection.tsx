import { useHomeState } from "../../../hooks/useHomeState";
import { Button } from "../../ui/button";
import Uploader from "../Uploader";

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export type HomeState = ReturnType<typeof useHomeState>;

type Props = {
  state: HomeState;
};

export default function GeneratorSection({ state }: Props) {
  const {
    cvId,
    jobId,
    result,
    isPending,
    error,
    uploadCVFile,
    uploadCVText,
    uploadJobFile,
    uploadJobText,
    setCvId,
    setJobId,
    handleGenerate,
    canGenerate,
  } = state;

  if (result) return null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* CV */}
        <div className="space-y-2">
          <Uploader
            label="CV"
            placeholder="Paste your CV here..."
            uploadFile={uploadCVFile}
            uploadText={uploadCVText}
            onSuccess={(id) => setCvId(id ?? null)}
            getId={(res) => res.cv?._id}
          />

          {cvId && (
            <p className="text-xs text-primary flex items-center gap-1.5">
              <span>✓</span> CV uploaded successfully
            </p>
          )}
        </div>

        {/* Job */}
        <div className="space-y-2">
          <Uploader
            label="Job listing"
            placeholder="Paste the job listing here..."
            uploadFile={uploadJobFile}
            uploadText={uploadJobText}
            onSuccess={(id) => setJobId(id ?? null)}
            getId={(res) => res.job?._id}
          />

          {jobId && (
            <p className="text-xs text-primary flex items-center gap-1.5">
              <span>✓</span> Job listing uploaded successfully
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-center text-sm text-error">{error.message}</p>}

      <div className="flex justify-center pt-2">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="px-10 py-6 text-sm font-semibold border-border btn-primary text-white hover:bg-primary-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon /> Generating…
            </span>
          ) : (
            "Generate application"
          )}
        </Button>
      </div>
    </div>
  );
}
