import { Link } from 'react-router-dom';
import { formatCurrency, formatLongDate, formatNumber } from '../../lib/format';
import type { CustomerSummary } from '../../lib/customers';

export default function CustomerTable({ customers }: { customers: CustomerSummary[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Customers. Select a name to see the customer&apos;s orders.</caption>
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
            <th scope="col" className="px-4 py-3 font-semibold">Email</th>
            <th scope="col" className="px-4 py-3 font-semibold">Customer since</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Orders</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Total spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
              <td className="px-4 py-3 font-medium">
                <Link to={`/customers/${customer.id}`} className="text-brand-600 hover:underline dark:text-brand-500">
                  {customer.name}
                </Link>
              </td>
              <td className="px-4 py-3">{customer.email}</td>
              <td className="px-4 py-3">{formatLongDate(customer.joinedAt)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatNumber(customer.orderCount)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(customer.totalSpent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
