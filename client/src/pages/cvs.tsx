import { useCVs } from "../api";
import { CVCard } from "../components/cvs/CVCard";

export function CVsPage() {
  const { data: cvs, isLoading } = useCVs();

  return (
    <div className="mx-auto max-w-6xl p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CV Library</h1>
        <p className="text-muted-foreground">Manage and reuse your uploaded CVs</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Saved CVs</h2>

        {isLoading && <p>Loading...</p>}

        {!isLoading && cvs?.length === 0 && <p className="text-muted-foreground">No CVs uploaded yet.</p>}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cvs?.map((cv: any) => (
            <CVCard key={cv._id} cv={cv} />
          ))}
        </div>
      </section>
    </div>
  );
}
