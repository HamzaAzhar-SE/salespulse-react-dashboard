import type { Customer, Order } from '../types';
import {
  filterCustomers,
  ordersForCustomer,
  sortCustomers,
  summarizeCustomer,
  summarizeCustomers,
} from './customers';

const customers: Customer[] = [
  { id: 'c1', name: 'Ali Raza', email: 'ali.raza@example.com', joinedAt: '2026-08-18' },
  { id: 'c2', name: 'Sara Khan', email: 'sara@example.com', joinedAt: '2026-09-02' },
  { id: 'c3', name: 'Zain Abbas', email: 'zain@example.com', joinedAt: '2026-10-20' },
];

function makeOrder(overrides: Partial<Order>): Order {
  return {
    id: 'ORD-1',
    customerId: 'c1',
    customerName: 'Ali Raza',
    date: '2026-10-10',
    amount: 100,
    status: 'paid',
    category: 'Software',
    ...overrides,
  };
}

const orders: Order[] = [
  makeOrder({ id: 'ORD-3001', date: '2026-10-10', amount: 100, status: 'paid' }),
  makeOrder({ id: 'ORD-3002', date: '2026-10-12', amount: 300, status: 'shipped' }),
  makeOrder({ id: 'ORD-3003', date: '2026-10-13', amount: 500, status: 'cancelled' }),
  makeOrder({ id: 'ORD-3004', customerId: 'c2', customerName: 'Sara Khan', date: '2026-10-05', amount: 50 }),
];

describe('summarizeCustomers', () => {
  const summaries = summarizeCustomers(customers, orders);
  const byId = (id: string) => summaries.find((s) => s.id === id)!;

  it('counts orders and money without cancelled orders', () => {
    expect(byId('c1')).toMatchObject({ orderCount: 2, totalSpent: 400, averageOrderValue: 200 });
  });

  it('uses the newest order that counts as the last order date', () => {
    expect(byId('c1').lastOrderDate).toBe('2026-10-12');
  });

  it('gives a customer with no orders zeros and no last order date', () => {
    expect(byId('c3')).toMatchObject({ orderCount: 0, totalSpent: 0, averageOrderValue: 0, lastOrderDate: null });
  });

  it('keeps one summary per customer', () => {
    expect(summaries).toHaveLength(3);
    expect(byId('c2').totalSpent).toBe(50);
  });
});

describe('summarizeCustomer', () => {
  it('works with only that customer\'s orders', () => {
    const summary = summarizeCustomer(customers[0], [makeOrder({ amount: 250 })]);
    expect(summary).toMatchObject({ orderCount: 1, totalSpent: 250, lastOrderDate: '2026-10-10' });
  });
});

describe('filterCustomers', () => {
  const summaries = summarizeCustomers(customers, orders);

  it('matches the name, ignoring case', () => {
    expect(filterCustomers(summaries, 'ALI').map((c) => c.id)).toEqual(['c1']);
  });

  it('matches the email', () => {
    expect(filterCustomers(summaries, 'sara@').map((c) => c.id)).toEqual(['c2']);
  });

  it('returns everyone for an empty search', () => {
    expect(filterCustomers(summaries, '   ')).toHaveLength(3);
  });
});

describe('sortCustomers', () => {
  const summaries = summarizeCustomers(customers, orders);
  const ids = (key: Parameters<typeof sortCustomers>[1]) => sortCustomers(summaries, key).map((c) => c.id);

  it('sorts names from A to Z', () => {
    expect(ids('name')).toEqual(['c1', 'c2', 'c3']);
  });

  it('puts the biggest spender first', () => {
    expect(ids('totalSpent')).toEqual(['c1', 'c2', 'c3']);
  });

  it('puts the customer with the most orders first', () => {
    expect(ids('orderCount')).toEqual(['c1', 'c2', 'c3']);
  });

  it('puts the newest customer first', () => {
    expect(ids('joinedAt')).toEqual(['c3', 'c2', 'c1']);
  });

  it('does not change the original list', () => {
    const copy = [...summaries];
    sortCustomers(summaries, 'joinedAt');
    expect(summaries).toEqual(copy);
  });
});

describe('ordersForCustomer', () => {
  it('returns only that customer\'s orders, newest first, cancelled included', () => {
    expect(ordersForCustomer(orders, 'c1').map((o) => o.id)).toEqual(['ORD-3003', 'ORD-3002', 'ORD-3001']);
  });

  it('returns an empty list for a customer with no orders', () => {
    expect(ordersForCustomer(orders, 'c3')).toEqual([]);
  });
});
