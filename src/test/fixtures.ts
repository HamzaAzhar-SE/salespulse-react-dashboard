import type { Customer, Order } from '../types';

export const fixtureCustomers: Customer[] = [
  { id: 'c1', name: 'Ali Raza', email: 'ali.raza@example.com', joinedAt: '2026-08-18' },
  { id: 'c2', name: 'Sara Khan', email: 'sara.khan@example.com', joinedAt: '2026-09-02' },
  { id: 'c3', name: 'Zain Abbas', email: 'zain.abbas@example.com', joinedAt: '2026-10-20' },
];

export const fixtureOrders: Order[] = [
  { id: 'ORD-3001', customerId: 'c1', customerName: 'Ali Raza', date: '2026-10-10', amount: 100, status: 'paid', category: 'Software' },
  { id: 'ORD-3002', customerId: 'c1', customerName: 'Ali Raza', date: '2026-10-12', amount: 300, status: 'shipped', category: 'Hardware' },
  { id: 'ORD-3003', customerId: 'c1', customerName: 'Ali Raza', date: '2026-10-13', amount: 500, status: 'cancelled', category: 'Hardware' },
  { id: 'ORD-3004', customerId: 'c2', customerName: 'Sara Khan', date: '2026-10-05', amount: 50, status: 'pending', category: 'Services' },
];

/** Replaces fetch with a fake API. Set state.fail = true to make every request fail with a 500. */
export function stubApi(state: { fail: boolean } = { fail: false }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (state.fail) return Promise.resolve(new Response('Server error', { status: 500 }));
      const body = url.endsWith('/orders') ? fixtureOrders : fixtureCustomers;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
}
