import { useCallback, useMemo, useRef, useState } from 'react';
import ErrorState from '../components/ErrorState';
import OrderDetailsPanel from '../components/orders/OrderDetailsPanel';
import OrdersTable from '../components/orders/OrdersTable';
import OrdersTableSkeleton from '../components/orders/OrdersTableSkeleton';
import OrdersToolbar from '../components/orders/OrdersToolbar';
import Pagination from '../components/orders/Pagination';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { downloadCsv } from '../lib/download';
import {
  filterOrders,
  ordersToCsv,
  paginate,
  sortOrders,
  type SortKey,
  type SortState,
  type StatusFilter,
} from '../lib/orders';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const orders = useOrders();
  const customers = useCustomers();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortState>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Search, filter and sort run on the full list. Pagination then cuts out one page.
  const processed = useMemo(
    () => (orders.data ? sortOrders(filterOrders(orders.data, { query, status }), sort) : []),
    [orders.data, query, status, sort],
  );
  const current = paginate(processed, page, PAGE_SIZE);

  const selectedOrder = selectedId ? (orders.data?.find((o) => o.id === selectedId) ?? null) : null;
  const selectedCustomer = selectedOrder
    ? customers.data?.find((c) => c.id === selectedOrder.customerId)
    : undefined;

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function changeStatus(value: StatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    setSort((previous) =>
      previous.key === key
        ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'amount' || key === 'date' ? 'desc' : 'asc' },
    );
    setPage(1);
  }

  function openOrder(orderId: string) {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedId(orderId);
  }

  const closePanel = useCallback(() => {
    setSelectedId(null);
    triggerRef.current?.focus();
  }, []);

  /** Exports every order that matches the current search and filter, in the current sort order. */
  function exportCsv() {
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(`orders-${today}.csv`, ordersToCsv(processed));
  }

  function retry() {
    void orders.refetch();
    if (customers.isError) void customers.refetch();
  }

  const hasNoOrdersAtAll = (orders.data?.length ?? 0) === 0;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {orders.data ? `${orders.data.length} orders in total` : 'Browse and review sales orders'}
        </p>
      </header>

      {orders.isError ? (
        <ErrorState
          title="Could not load the orders"
          message={orders.error.message}
          onRetry={retry}
          retrying={orders.isFetching}
        />
      ) : orders.isPending ? (
        <OrdersTableSkeleton />
      ) : (
        <>
          <OrdersToolbar
            query={query}
            status={status}
            exportCount={processed.length}
            onQueryChange={changeQuery}
            onStatusChange={changeStatus}
            onExport={exportCsv}
          />

          {processed.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="font-medium">
                {hasNoOrdersAtAll ? 'There are no orders yet.' : 'No orders match your search or filter.'}
              </p>
              {!hasNoOrdersAtAll && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <OrdersTable orders={current.items} sort={sort} onSort={toggleSort} onSelect={openOrder} />
              <Pagination
                page={current.page}
                totalPages={current.totalPages}
                from={current.from}
                to={current.to}
                total={current.total}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {selectedOrder && (
        <OrderDetailsPanel order={selectedOrder} customer={selectedCustomer} onClose={closePanel} />
      )}
    </section>
  );
}
