import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import KpiCard from '../components/dashboard/KpiCard';
import Skeleton from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { ordersForCustomer, summarizeCustomer } from '../lib/customers';
import { formatCurrency, formatLongDate, formatNumber } from '../lib/format';

const backLinkClass = 'text-sm font-medium text-brand-600 hover:underline dark:text-brand-500';

export default function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const customers = useCustomers();
  const orders = useOrders();

  const customer = customers.data?.find((c) => c.id === customerId);
  const history = useMemo(
    () => (orders.data && customerId ? ordersForCustomer(orders.data, customerId) : []),
    [orders.data, customerId],
  );
  const summary = useMemo(() => (customer ? summarizeCustomer(customer, history) : null), [customer, history]);

  const failed = customers.isError || orders.isError;
  const loading = customers.isPending || orders.isPending;

  function retry() {
    void customers.refetch();
    void orders.refetch();
  }

  if (failed) {
    return (
      <section>
        <Link to="/customers" className={backLinkClass}>
          Back to all customers
        </Link>
        <div className="mt-4">
          <ErrorState
            title="Could not load this customer"
            message={(customers.error ?? orders.error)?.message ?? 'Something went wrong.'}
            onRetry={retry}
            retrying={customers.isFetching || orders.isFetching}
          />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div role="status" aria-label="Loading customer">
        <span className="sr-only">Loading customer</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (!customer || !summary) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Customer not found</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">There is no customer with this ID.</p>
        <Link to="/customers" className={`${backLinkClass} mt-4 inline-block`}>
          Back to all customers
        </Link>
      </section>
    );
  }

  return (
    <section>
      <Link to="/customers" className={backLinkClass}>
        Back to all customers
      </Link>

      <header className="mb-6 mt-3">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {customer.email} &middot; Customer since {formatLongDate(customer.joinedAt)}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Orders" value={formatNumber(summary.orderCount)} hint="Cancelled orders not counted" />
        <KpiCard label="Total spent" value={formatCurrency(summary.totalSpent)} hint="Cancelled orders not counted" />
        <KpiCard label="Average order value" value={formatCurrency(summary.averageOrderValue)} hint="Total spent divided by orders" />
        <KpiCard label="Last order" value={summary.lastOrderDate ? formatLongDate(summary.lastOrderDate) : 'None yet'} />
      </div>

      <section aria-labelledby="history-heading" className="mt-8">
        <h2 id="history-heading" className="mb-3 text-lg font-semibold">
          Order history
        </h2>

        {history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
            <p className="font-medium">This customer has no orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Orders placed by {customer.name}, newest first</caption>
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Order ID</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">{formatLongDate(order.date)}</td>
                    <td className="px-4 py-3">{order.category}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
