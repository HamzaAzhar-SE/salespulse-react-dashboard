import type { Customer, Order } from '../types';
import { addDays, computeSummary, getReferenceDate, revenueByDay, salesByCategory } from './stats';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-1',
    customerId: 'c1',
    customerName: 'Test Customer',
    date: '2026-10-10',
    amount: 100,
    status: 'paid',
    category: 'Software',
    ...overrides,
  };
}

const customers: Customer[] = [
  { id: 'c1', name: 'New One', email: 'a@example.com', joinedAt: '2026-10-05' },
  { id: 'c2', name: 'Old One', email: 'b@example.com', joinedAt: '2026-06-01' },
];

const orders: Order[] = [
  makeOrder({ id: 'a', date: '2026-10-10', amount: 100 }),
  makeOrder({ id: 'b', date: '2026-10-12', amount: 300, status: 'shipped', category: 'Hardware' }),
  makeOrder({ id: 'c', date: '2026-10-12', amount: 500, status: 'cancelled', category: 'Hardware' }),
  makeOrder({ id: 'd', date: '2026-09-01', amount: 999 }),
];

describe('addDays', () => {
  it('moves across month and year boundaries', () => {
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('getReferenceDate', () => {
  it('returns the newest order date', () => {
    expect(getReferenceDate(orders)).toBe('2026-10-12');
  });
});

describe('computeSummary', () => {
  it('ignores cancelled orders and orders outside the 30 day window', () => {
    const summary = computeSummary(orders, customers, '2026-10-12');
    expect(summary.totalRevenue).toBe(400);
    expect(summary.orderCount).toBe(2);
    expect(summary.averageOrderValue).toBe(200);
  });

  it('returns an average of 0 when there are no orders', () => {
    const summary = computeSummary([], customers, '2026-10-12');
    expect(summary.averageOrderValue).toBe(0);
  });

  it('counts only customers who joined inside the window', () => {
    expect(computeSummary(orders, customers, '2026-10-12').newCustomers).toBe(1);
  });
});

describe('revenueByDay', () => {
  it('returns 30 days ending on the reference date, filling empty days with 0', () => {
    const points = revenueByDay(orders, '2026-10-12');
    expect(points).toHaveLength(30);
    expect(points[points.length - 1].date).toBe('2026-10-12');
    expect(points.find((p) => p.date === '2026-10-10')?.revenue).toBe(100);
    expect(points.find((p) => p.date === '2026-10-11')?.revenue).toBe(0);
    expect(points.find((p) => p.date === '2026-10-12')?.revenue).toBe(300);
  });
});

describe('salesByCategory', () => {
  it('sums sales per category, biggest first, without cancelled orders', () => {
    expect(salesByCategory(orders, '2026-10-12')).toEqual([
      { category: 'Hardware', sales: 300 },
      { category: 'Software', sales: 100 },
    ]);
  });
});
