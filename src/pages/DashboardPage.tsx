import { useMemo } from 'react';
import CategoryChart from '../components/dashboard/CategoryChart';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import KpiCard from '../components/dashboard/KpiCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ErrorState from '../components/ErrorState';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency, formatNumber, formatShortDate } from '../lib/format';
import { computeSummary, getReferenceDate, revenueByDay, salesByCategory } from '../lib/stats';

const WINDOW_DAYS = 30;

export default function DashboardPage() {
  const orders = useOrders();
  const customers = useCustomers();

  const stats = useMemo(() => {
    if (!orders.data || !customers.data) return null;
    const referenceDate = getReferenceDate(orders.data);
    return {
      referenceDate,
      summary: computeSummary(orders.data, customers.data, referenceDate, WINDOW_DAYS),
      revenue: revenueByDay(orders.data, referenceDate, WINDOW_DAYS),
      categories: salesByCategory(orders.data, referenceDate, WINDOW_DAYS),
    };
  }, [orders.data, customers.data]);

  const failed = orders.isError || customers.isError;
  const errorMessage = (orders.error ?? customers.error)?.message ?? 'Could not load the dashboard.';

  function retry() {
    void orders.refetch();
    void customers.refetch();
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {stats
            ? `Last ${WINDOW_DAYS} days, up to ${formatShortDate(stats.referenceDate)}`
            : 'Sales overview'}
        </p>
      </header>

      {failed ? (
        <ErrorState
          title="Could not load the dashboard"
          message={errorMessage}
          onRetry={retry}
          retrying={orders.isFetching || customers.isFetching}
        />
      ) : !stats ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Total revenue"
              value={formatCurrency(stats.summary.totalRevenue)}
              hint="Cancelled orders not counted"
            />
            <KpiCard label="Orders" value={formatNumber(stats.summary.orderCount)} hint="Cancelled orders not counted" />
            <KpiCard
              label="Average order value"
              value={formatCurrency(stats.summary.averageOrderValue)}
              hint="Revenue divided by orders"
            />
            <KpiCard
              label="New customers"
              value={formatNumber(stats.summary.newCustomers)}
              hint="Joined in this period"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RevenueChart data={stats.revenue} />
            <CategoryChart data={stats.categories} />
          </div>
        </>
      )}
    </section>
  );
}
