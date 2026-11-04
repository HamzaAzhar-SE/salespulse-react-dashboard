import { useMemo, useState } from 'react';
import CustomerCards from '../components/customers/CustomerCards';
import CustomerTable from '../components/customers/CustomerTable';
import CustomersSkeleton from '../components/customers/CustomersSkeleton';
import CustomersToolbar, { type CustomerView } from '../components/customers/CustomersToolbar';
import ErrorState from '../components/ErrorState';
import { useCustomers } from '../hooks/useCustomers';
import { useOrders } from '../hooks/useOrders';
import { filterCustomers, sortCustomers, summarizeCustomers, type CustomerSortKey } from '../lib/customers';

export default function CustomersPage() {
  const customers = useCustomers();
  const orders = useOrders();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CustomerSortKey>('name');
  const [view, setView] = useState<CustomerView>('cards');

  // The totals need both lists, so the page waits for both.
  const summaries = useMemo(
    () => (customers.data && orders.data ? summarizeCustomers(customers.data, orders.data) : null),
    [customers.data, orders.data],
  );
  const visible = useMemo(
    () => (summaries ? sortCustomers(filterCustomers(summaries, query), sort) : []),
    [summaries, query, sort],
  );

  const failed = customers.isError || orders.isError;
  const errorMessage = (customers.error ?? orders.error)?.message ?? 'Could not load the customers.';

  function retry() {
    void customers.refetch();
    void orders.refetch();
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {summaries ? `${summaries.length} customers` : 'See who is buying and how much they spend'}
        </p>
      </header>

      {failed ? (
        <ErrorState
          title="Could not load the customers"
          message={errorMessage}
          onRetry={retry}
          retrying={customers.isFetching || orders.isFetching}
        />
      ) : !summaries ? (
        <CustomersSkeleton />
      ) : (
        <>
          <CustomersToolbar
            query={query}
            sort={sort}
            view={view}
            onQueryChange={setQuery}
            onSortChange={setSort}
            onViewChange={setView}
          />

          {visible.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="font-medium">
                {summaries.length === 0 ? 'There are no customers yet.' : 'No customers match your search.'}
              </p>
              {summaries.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <p aria-live="polite" className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                Showing {visible.length} of {summaries.length} customers
              </p>
              {view === 'cards' ? <CustomerCards customers={visible} /> : <CustomerTable customers={visible} />}
            </>
          )}
        </>
      )}
    </section>
  );
}
