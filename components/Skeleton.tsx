export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
