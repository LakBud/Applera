export function CVApplicationRowSkeleton() {
  return (
    <div className="flex items-center bg-white/40 justify-between gap-4 px-4 py-3.5 border border-border">
      {/* left */}
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 bg-muted animate-pulse rounded" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* middle */}
      <div className="hidden sm:block h-3 w-10 bg-muted animate-pulse rounded shrink-0" />

      {/* right */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block h-3 w-16 bg-muted animate-pulse rounded" />
        <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
      </div>
    </div>
  );
}
