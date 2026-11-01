import type { Order } from '../types';
import { escapeCsvField, filterOrders, ordersToCsv, paginate, sortOrders } from './orders';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ORD-1001',
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
  makeOrder({ id: 'ORD-1001', customerName: 'Ali Raza', date: '2026-10-10', amount: 100, status: 'paid' }),
  makeOrder({ id: 'ORD-1002', customerName: 'Sara Khan', date: '2026-10-12', amount: 300, status: 'shipped' }),
  makeOrder({ id: 'ORD-1010', customerName: 'Usman Tariq', date: '2026-10-11', amount: 50, status: 'cancelled' }),
];

describe('filterOrders', () => {
  it('matches the customer name, ignoring case and spaces around the text', () => {
    expect(filterOrders(orders, { query: '  sara ', status: 'all' }).map((o) => o.id)).toEqual(['ORD-1002']);
  });

  it('matches the order ID', () => {
    expect(filterOrders(orders, { query: 'ord-1010', status: 'all' })).toHaveLength(1);
  });

  it('filters by status', () => {
    expect(filterOrders(orders, { query: '', status: 'cancelled' }).map((o) => o.id)).toEqual(['ORD-1010']);
  });

  it('combines search and status', () => {
    expect(filterOrders(orders, { query: 'ali', status: 'shipped' })).toEqual([]);
  });
});

describe('sortOrders', () => {
  it('sorts amounts as numbers, not as text', () => {
    const asc = sortOrders(orders, { key: 'amount', direction: 'asc' }).map((o) => o.amount);
    expect(asc).toEqual([50, 100, 300]);
  });

  it('sorts descending by date', () => {
    const ids = sortOrders(orders, { key: 'date', direction: 'desc' }).map((o) => o.id);
    expect(ids).toEqual(['ORD-1002', 'ORD-1010', 'ORD-1001']);
  });

  it('sorts order IDs naturally (1002 before 1010)', () => {
    const ids = sortOrders(orders, { key: 'id', direction: 'asc' }).map((o) => o.id);
    expect(ids).toEqual(['ORD-1001', 'ORD-1002', 'ORD-1010']);
  });

  it('does not change the original list', () => {
    const copy = [...orders];
    sortOrders(orders, { key: 'amount', direction: 'desc' });
    expect(orders).toEqual(copy);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('returns the right slice and counts for the last page', () => {
    const result = paginate(items, 3, 10);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
    expect(result).toMatchObject({ page: 3, totalPages: 3, total: 25, from: 21, to: 25 });
  });

  it('keeps the page number inside the valid range', () => {
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
  });

  it('handles an empty list', () => {
    expect(paginate([], 1, 10)).toMatchObject({ items: [], totalPages: 1, from: 0, to: 0, total: 0 });
  });
});

describe('CSV export', () => {
  it('quotes fields that contain commas and quotes', () => {
    expect(escapeCsvField('Khan, Sara')).toBe('"Khan, Sara"');
    expect(escapeCsvField('Say "hi"')).toBe('"Say ""hi"""');
  });

  it('neutralises spreadsheet formulas', () => {
    expect(escapeCsvField('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(escapeCsvField(-5)).toBe('-5');
  });

  it('writes a header row and one line per order', () => {
    const lines = ordersToCsv(orders).split('\r\n');
    expect(lines[0]).toBe('Order ID,Customer,Date,Category,Amount,Status');
    expect(lines).toHaveLength(4);
    expect(lines[2]).toBe('ORD-1002,Sara Khan,2026-10-12,Software,300,Shipped');
  });
});
