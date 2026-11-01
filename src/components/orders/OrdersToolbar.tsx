import { STATUS_OPTIONS, type StatusFilter } from '../../lib/orders';

interface Props {
  query: string;
  status: StatusFilter;
  exportCount: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onExport: () => void;
}

const fieldClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

export default function OrdersToolbar({ query, status, exportCount, onQueryChange, onStatusChange, onExport }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="order-search" className="block text-sm font-medium">
          Search orders
        </label>
        <input
          id="order-search"
          type="search"
          placeholder="Order ID or customer name"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="sm:w-48">
        <label htmlFor="status-filter" className="block text-sm font-medium">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={fieldClass}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={exportCount === 0}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        Export CSV ({exportCount})
      </button>
    </div>
  );
}
