export function CVCardSkeleton() {
  return (
    <div className="w-full h-full rounded-lg ring-1 ring-green-700 ring-border overflow-hidden flex flex-col animate-pulse">
      {/* image */}
      <div className="w-full h-56 bg-border/40" />

      {/* header */}
      <div className="px-6 pt-5 space-y-2">
        <div className="h-4 w-32 bg-border/60 rounded" />
        <div className="h-3 w-24 bg-border/40 rounded" />
      </div>

      {/* content */}
      <div className="px-6 pt-4 space-y-3 flex-1">
        <div className="flex gap-1.5 flex-wrap">
          {[48, 64, 56, 40].map((w, i) => (
            <div key={i} className="h-6 bg-border/40 rounded-md" style={{ width: w }} />
          ))}
        </div>
        <div className="h-3 w-40 bg-border/40 rounded" />
      </div>

      {/* footer */}
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="h-8 w-16 bg-border/40 rounded-md" />
        <div className="h-3 w-20 bg-border/40 rounded" />
      </div>
    </div>
  );
}
