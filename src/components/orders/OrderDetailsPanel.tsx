import { useEffect, useRef } from 'react';
import { formatCurrency, formatLongDate } from '../../lib/format';
import type { Customer, Order } from '../../types';
import StatusBadge from '../StatusBadge';

interface Props {
  order: Order;
  customer?: Customer;
  onClose: () => void;
}

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function OrderDetailsPanel({ order, customer, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the panel when it opens.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape closes the panel. Tab stays inside it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const details: { label: string; value: string }[] = [
    { label: 'Customer', value: order.customerName },
    { label: 'Email', value: customer?.email ?? 'Not available' },
    { label: 'Customer since', value: customer ? formatLongDate(customer.joinedAt) : 'Not available' },
    { label: 'Order date', value: formatLongDate(order.date) },
    { label: 'Category', value: order.category },
    { label: 'Amount', value: formatCurrency(order.amount) },
  ];

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-panel-title"
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-panel-title" className="text-xl font-bold">
              Order {order.id}
            </h2>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <dl className="mt-6 divide-y divide-slate-100 dark:divide-slate-700">
          {details.map((item) => (
            <div key={item.label} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-slate-500 dark:text-slate-400">{item.label}</dt>
              <dd className="text-right font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
