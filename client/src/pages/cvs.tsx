import { useCVs } from "../api";
import { usePinCV } from "../api/hooks/useCV";
import { Loader } from "../components/common/Loader";
import { CVCard } from "../components/cvs/CVCard";

export function CVsPage() {
  const { data: cvs, isLoading } = useCVs();
  const { mutate: pinCv, isPending: isPinning } = usePinCV();

  const pinnedCount = cvs?.filter((cv: any) => cv.pinned).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CV Library</h1>
        <p className="text-muted-foreground">Manage and reuse your uploaded CVs</p>
      </div>

      <section className="space-y-4">
        {isLoading && <Loader />}
        {!isLoading && cvs?.length === 0 && <p className="text-muted-foreground">No CVs uploaded yet.</p>}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cvs?.map((cv: any) => (
            <CVCard
              key={cv._id}
              cv={cv}
              onPin={() => pinCv(cv._id)}
              isPinning={isPinning}
              canPin={!cv.pinned && pinnedCount >= 5}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
