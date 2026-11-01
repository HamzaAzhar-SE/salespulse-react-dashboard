import { statusLabel } from '../lib/orders';
import type { OrderStatus } from '../types';

const styles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
