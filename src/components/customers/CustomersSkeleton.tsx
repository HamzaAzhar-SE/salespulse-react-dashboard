import Skeleton from '../Skeleton';

export default function CustomersSkeleton() {
  return (
    <div role="status" aria-label="Loading customers">
      <span className="sr-only">Loading customers</span>
      <Skeleton className="mb-4 h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-44" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
