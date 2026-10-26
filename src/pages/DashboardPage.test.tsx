import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Customer, Order } from '../types';
import { createTestQueryClient } from '../test/utils';
import DashboardPage from './DashboardPage';

const orders: Order[] = [
  { id: 'o1', customerId: 'c1', customerName: 'A', date: '2026-10-10', amount: 100, status: 'paid', category: 'Software' },
  { id: 'o2', customerId: 'c1', customerName: 'A', date: '2026-10-12', amount: 300, status: 'shipped', category: 'Hardware' },
  { id: 'o3', customerId: 'c2', customerName: 'B', date: '2026-10-12', amount: 500, status: 'cancelled', category: 'Hardware' },
];

const customers: Customer[] = [
  { id: 'c1', name: 'A', email: 'a@example.com', joinedAt: '2026-10-05' },
  { id: 'c2', name: 'B', email: 'b@example.com', joinedAt: '2026-06-01' },
];

function renderDashboard() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

function stubApi(state: { fail: boolean }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (state.fail) return Promise.resolve(new Response('Server error', { status: 500 }));
      const body = url.endsWith('/orders') ? orders : customers;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DashboardPage', () => {
  it('shows a loading skeleton first, then the four KPI cards', async () => {
    stubApi({ fail: false });
    renderDashboard();

    expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument();

    const revenue = await screen.findByRole('group', { name: 'Total revenue' });
    expect(within(revenue).getByText('$400')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Orders' })).getByText('2')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Average order value' })).getByText('$200')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'New customers' })).getByText('1')).toBeInTheDocument();
  });

  it('shows both charts', async () => {
    stubApi({ fail: false });
    renderDashboard();
    expect(await screen.findByRole('img', { name: /line chart of daily revenue/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bar chart of sales/i })).toBeInTheDocument();
  });

  it('shows an error with a Retry button, and recovers after Retry', async () => {
    const state = { fail: true };
    stubApi(state);
    renderDashboard();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not load the dashboard');

    state.fail = false;
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: 'Total revenue' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
