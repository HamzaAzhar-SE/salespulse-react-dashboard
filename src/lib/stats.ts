import type { Customer, Order } from '../types';

export interface SummaryStats {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  newCustomers: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface CategorySales {
  category: string;
  sales: number;
}

const DAY_MS = 86_400_000;

/** Adds days to a "YYYY-MM-DD" date and returns "YYYY-MM-DD" (UTC, so no time zone surprises). */
export function addDays(isoDate: string, days: number): string {
  const time = Date.parse(`${isoDate}T00:00:00Z`) + days * DAY_MS;
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * The dashboard counts "last 30 days" back from the newest order, not from today.
 * This keeps the fake data useful whenever you run the project.
 * With a real API, pass today's date instead.
 */
export function getReferenceDate(orders: Order[]): string {
  if (orders.length === 0) return new Date().toISOString().slice(0, 10);
  return orders.reduce((latest, order) => (order.date > latest ? order.date : latest), orders[0].date);
}

function windowStart(referenceDate: string, windowDays: number): string {
  return addDays(referenceDate, -(windowDays - 1));
}

/** Orders that count toward sales: inside the window and not cancelled. */
function countedOrders(orders: Order[], referenceDate: string, windowDays: number): Order[] {
  const start = windowStart(referenceDate, windowDays);
  return orders.filter(
    (order) => order.status !== 'cancelled' && order.date >= start && order.date <= referenceDate,
  );
}

export function computeSummary(
  orders: Order[],
  customers: Customer[],
  referenceDate: string,
  windowDays = 30,
): SummaryStats {
  const counted = countedOrders(orders, referenceDate, windowDays);
  const totalRevenue = counted.reduce((sum, order) => sum + order.amount, 0);
  const orderCount = counted.length;
  const start = windowStart(referenceDate, windowDays);

  return {
    totalRevenue,
    orderCount,
    averageOrderValue: orderCount === 0 ? 0 : totalRevenue / orderCount,
    newCustomers: customers.filter((c) => c.joinedAt >= start && c.joinedAt <= referenceDate).length,
  };
}

/** One point per day, including days with no sales (revenue 0). */
export function revenueByDay(orders: Order[], referenceDate: string, windowDays = 30): RevenuePoint[] {
  const totals = new Map<string, number>();
  for (const order of countedOrders(orders, referenceDate, windowDays)) {
    totals.set(order.date, (totals.get(order.date) ?? 0) + order.amount);
  }

  const first = windowStart(referenceDate, windowDays);
  return Array.from({ length: windowDays }, (_, index) => {
    const date = addDays(first, index);
    return { date, revenue: totals.get(date) ?? 0 };
  });
}

/** Sales per category, biggest first. */
export function salesByCategory(orders: Order[], referenceDate: string, windowDays = 30): CategorySales[] {
  const totals = new Map<string, number>();
  for (const order of countedOrders(orders, referenceDate, windowDays)) {
    totals.set(order.category, (totals.get(order.category) ?? 0) + order.amount);
  }
  return [...totals.entries()]
    .map(([category, sales]) => ({ category, sales }))
    .sort((a, b) => b.sales - a.sales);
}
