export function ApplicationRowSkeleton() {
  return (
    <div className="px-4 py-3.5 flex items-center gap-4">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 bg-muted animate-pulse rounded" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-5 w-20 bg-muted animate-pulse rounded" />
    </div>
  );
}
