import type { Order, OrderStatus } from '../types';

export type StatusFilter = OrderStatus | 'all';

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function statusLabel(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ---------- search and filter ---------- */

export interface OrderFilters {
  query: string;
  status: StatusFilter;
}

/** Search matches the order ID or the customer name. */
export function filterOrders(orders: Order[], { query, status }: OrderFilters): Order[] {
  const needle = query.trim().toLowerCase();
  return orders.filter((order) => {
    if (status !== 'all' && order.status !== status) return false;
    if (!needle) return true;
    return order.id.toLowerCase().includes(needle) || order.customerName.toLowerCase().includes(needle);
  });
}

/* ---------- sorting ---------- */

export type SortKey = 'id' | 'customerName' | 'date' | 'amount' | 'status';
export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export function sortOrders(orders: Order[], { key, direction }: SortState): Order[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...orders].sort((a, b) => {
    const result =
      key === 'amount'
        ? a.amount - b.amount
        : a[key].localeCompare(b[key], 'en', { numeric: true });
    // Same value? Fall back to the order ID so the order never jumps around.
    return result !== 0 ? result * factor : a.id.localeCompare(b.id, 'en', { numeric: true });
  });
}

/* ---------- pagination ---------- */

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return {
    items: items.slice(start, end),
    page: safePage,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: end,
  };
}

/* ---------- CSV export ---------- */

/**
 * Quotes a CSV field when needed. Text that starts with = + - or @ gets a leading
 * apostrophe, so Excel never runs it as a formula.
 */
export function escapeCsvField(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function ordersToCsv(orders: Order[]): string {
  const header = ['Order ID', 'Customer', 'Date', 'Category', 'Amount', 'Status'];
  const rows = orders.map((o) => [o.id, o.customerName, o.date, o.category, o.amount, statusLabel(o.status)]);
  return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
