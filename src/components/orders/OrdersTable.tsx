import { formatCurrency, formatLongDate } from '../../lib/format';
import type { SortKey, SortState } from '../../lib/orders';
import type { Order } from '../../types';
import StatusBadge from '../StatusBadge';

interface Column {
  key: SortKey;
  label: string;
  align?: 'right';
}

const columns: Column[] = [
  { key: 'id', label: 'Order ID' },
  { key: 'customerName', label: 'Customer' },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status' },
];

interface Props {
  orders: Order[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  onSelect: (orderId: string) => void;
}

export default function OrdersTable({ orders, sort, onSort, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Orders. Select a column heading to sort. Select a row to see details.</caption>
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <tr>
            {columns.map((column) => {
              const active = sort.key === column.key;
              const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`px-4 py-3 font-semibold ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="inline-flex items-center gap-1 rounded hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    {column.label}
                    <span aria-hidden="true" className="w-3 text-xs">
                      {active ? (sort.direction === 'asc' ? '↑' : '↓') : ''}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelect(order.id)}
              className="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
            >
              <td className="px-4 py-3 font-medium">
                <button
                  type="button"
                  className="text-brand-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                >
                  {order.id}
                </button>
              </td>
              <td className="px-4 py-3">{order.customerName}</td>
              <td className="px-4 py-3">{formatLongDate(order.date)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(order.amount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
