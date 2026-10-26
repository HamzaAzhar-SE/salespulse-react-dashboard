import Skeleton from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-9 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[0, 1].map((n) => (
          <div key={n} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-72 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
