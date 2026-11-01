import Skeleton from '../Skeleton';

export default function OrdersTableSkeleton() {
  return (
    <div role="status" aria-label="Loading orders">
      <span className="sr-only">Loading orders</span>
      <Skeleton className="mb-4 h-10 w-full" />
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        {Array.from({ length: 8 }, (_, n) => (
          <Skeleton key={n} className="mb-3 h-8 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
