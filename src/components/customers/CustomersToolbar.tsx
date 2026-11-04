import { CUSTOMER_SORT_OPTIONS, type CustomerSortKey } from '../../lib/customers';

export type CustomerView = 'cards' | 'table';

interface Props {
  query: string;
  sort: CustomerSortKey;
  view: CustomerView;
  onQueryChange: (value: string) => void;
  onSortChange: (value: CustomerSortKey) => void;
  onViewChange: (value: CustomerView) => void;
}

const fieldClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

const viewButton = (active: boolean) =>
  `px-4 py-2 text-sm font-medium ${
    active
      ? 'bg-brand-600 text-white'
      : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'
  }`;

export default function CustomersToolbar({ query, sort, view, onQueryChange, onSortChange, onViewChange }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="customer-search" className="block text-sm font-medium">
          Search customers
        </label>
        <input
          id="customer-search"
          type="search"
          placeholder="Name or email"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="sm:w-56">
        <label htmlFor="customer-sort" className="block text-sm font-medium">
          Sort by
        </label>
        <select
          id="customer-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CustomerSortKey)}
          className={fieldClass}
        >
          {CUSTOMER_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div role="group" aria-label="View" className="flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
        <button type="button" aria-pressed={view === 'cards'} onClick={() => onViewChange('cards')} className={viewButton(view === 'cards')}>
          Cards
        </button>
        <button type="button" aria-pressed={view === 'table'} onClick={() => onViewChange('table')} className={viewButton(view === 'table')}>
          Table
        </button>
      </div>
    </div>
  );
}
