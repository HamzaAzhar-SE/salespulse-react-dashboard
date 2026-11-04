import { Link } from 'react-router-dom';
import { formatCurrency, formatLongDate, formatNumber } from '../../lib/format';
import type { CustomerSummary } from '../../lib/customers';

export default function CustomerCards({ customers }: { customers: CustomerSummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <li
          key={customer.id}
          className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
        >
          {/* The link stretches over the whole card, so the whole card is clickable. */}
          <h2 className="text-base font-semibold">
            <Link to={`/customers/${customer.id}`} className="after:absolute after:inset-0 hover:underline">
              {customer.name}
            </Link>
          </h2>
          <p className="break-all text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Total spent</dt>
              <dd className="font-semibold">{formatCurrency(customer.totalSpent)}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Orders</dt>
              <dd className="font-semibold">{formatNumber(customer.orderCount)}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Last order</dt>
              <dd className="font-semibold">{customer.lastOrderDate ? formatLongDate(customer.lastOrderDate) : 'None yet'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Customer since</dt>
              <dd className="font-semibold">{formatLongDate(customer.joinedAt)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
