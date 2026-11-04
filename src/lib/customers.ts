import type { Customer, Order } from '../types';

export interface CustomerSummary extends Customer {
  /** Orders that count as sales (cancelled orders are left out, like on the dashboard). */
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export type CustomerSortKey = 'name' | 'totalSpent' | 'orderCount' | 'joinedAt';

export const CUSTOMER_SORT_OPTIONS: { value: CustomerSortKey; label: string }[] = [
  { value: 'name', label: 'Name (A to Z)' },
  { value: 'totalSpent', label: 'Total spent (highest first)' },
  { value: 'orderCount', label: 'Most orders' },
  { value: 'joinedAt', label: 'Newest customers' },
];

/** Builds the totals for one customer. Pass in only that customer's orders. */
export function summarizeCustomer(customer: Customer, customerOrders: Order[]): CustomerSummary {
  const counted = customerOrders.filter((order) => order.status !== 'cancelled');
  const totalSpent = counted.reduce((sum, order) => sum + order.amount, 0);

  return {
    ...customer,
    orderCount: counted.length,
    totalSpent,
    averageOrderValue: counted.length === 0 ? 0 : totalSpent / counted.length,
    lastOrderDate: counted.length === 0 ? null : counted.reduce((latest, o) => (o.date > latest ? o.date : latest), counted[0].date),
  };
}

/** Totals for every customer, going through the orders only once. */
export function summarizeCustomers(customers: Customer[], orders: Order[]): CustomerSummary[] {
  const byCustomer = new Map<string, Order[]>();
  for (const order of orders) {
    const list = byCustomer.get(order.customerId);
    if (list) list.push(order);
    else byCustomer.set(order.customerId, [order]);
  }
  return customers.map((customer) => summarizeCustomer(customer, byCustomer.get(customer.id) ?? []));
}

/** Search matches the name or the email. */
export function filterCustomers(customers: CustomerSummary[], query: string): CustomerSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return customers;
  return customers.filter(
    (customer) => customer.name.toLowerCase().includes(needle) || customer.email.toLowerCase().includes(needle),
  );
}

/** Names go A to Z. Every number (and the join date) goes biggest or newest first. */
export function sortCustomers(customers: CustomerSummary[], key: CustomerSortKey): CustomerSummary[] {
  return [...customers].sort((a, b) => {
    switch (key) {
      case 'totalSpent':
        return b.totalSpent - a.totalSpent || a.name.localeCompare(b.name);
      case 'orderCount':
        return b.orderCount - a.orderCount || a.name.localeCompare(b.name);
      case 'joinedAt':
        return b.joinedAt.localeCompare(a.joinedAt) || a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

/** One customer's orders, newest first. Cancelled orders are included so the history is complete. */
export function ordersForCustomer(orders: Order[], customerId: string): Order[] {
  return orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id, 'en', { numeric: true }));
}
