import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Customer, Order, OrderStatus } from '../types';
import { downloadCsv } from '../lib/download';
import { createTestQueryClient } from '../test/utils';
import OrdersPage from './OrdersPage';

vi.mock('../lib/download', () => ({ downloadCsv: vi.fn() }));

const statuses: OrderStatus[] = ['paid', 'pending', 'shipped', 'cancelled'];

// 12 orders: ORD-2001 ... ORD-2012. Even index = Ali Raza (c1), odd = Sara Khan (c2).
const orders: Order[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ORD-${2001 + i}`,
  customerId: i % 2 === 0 ? 'c1' : 'c2',
  customerName: i % 2 === 0 ? 'Ali Raza' : 'Sara Khan',
  date: `2026-10-${String(i + 1).padStart(2, '0')}`,
  amount: (i + 1) * 10,
  status: statuses[i % 4],
  category: 'Software',
}));

const customers: Customer[] = [
  { id: 'c1', name: 'Ali Raza', email: 'ali.raza@example.com', joinedAt: '2026-08-18' },
  { id: 'c2', name: 'Sara Khan', email: 'sara.khan@example.com', joinedAt: '2026-09-02' },
];

function stubApi(state = { fail: false }) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (state.fail) return Promise.resolve(new Response('Server error', { status: 500 }));
      const body = url.endsWith('/orders') ? orders : customers;
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
}

function renderOrders() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <OrdersPage />
    </QueryClientProvider>,
  );
}

/** Data rows only (the header row is removed). */
function dataRows() {
  return screen.getAllByRole('row').slice(1);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(downloadCsv).mockClear();
});

describe('OrdersPage', () => {
  it('shows a loading skeleton, then the first 10 orders, newest first', async () => {
    stubApi();
    renderOrders();
    expect(screen.getByRole('status', { name: 'Loading orders' })).toBeInTheDocument();

    expect(await screen.findByRole('table')).toBeInTheDocument();
    const rows = dataRows();
    expect(rows).toHaveLength(10);
    expect(within(rows[0]).getByText('ORD-2012')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 12 orders')).toBeInTheDocument();
  });

  it('goes to the next page and back', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(dataRows()).toHaveLength(2);
    expect(screen.getByText('Showing 11 to 12 of 12 orders')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(dataRows()).toHaveLength(10);
  });

  it('searches by customer name', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');

    await userEvent.setup().type(screen.getByLabelText('Search orders'), 'sara');
    expect(dataRows()).toHaveLength(6);
    expect(screen.getByText('Showing 1 to 6 of 6 orders')).toBeInTheDocument();
  });

  it('filters by status', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');

    await userEvent.setup().selectOptions(screen.getByLabelText('Filter by status'), 'cancelled');
    expect(dataRows()).toHaveLength(3);
  });

  it('sorts by a column and reports it with aria-sort', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');

    await userEvent.setup().click(screen.getByRole('button', { name: /order id/i }));
    expect(screen.getByRole('columnheader', { name: /order id/i })).toHaveAttribute('aria-sort', 'ascending');
    expect(within(dataRows()[0]).getByText('ORD-2001')).toBeInTheDocument();
  });

  it('shows an empty state and clears the filters', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Search orders'), 'zzzz');
    expect(screen.getByText('No orders match your search or filter.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(dataRows()).toHaveLength(10);
  });

  it('opens the details panel for a row and closes it with Escape', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'ORD-2012' }));
    const dialog = screen.getByRole('dialog', { name: 'Order ORD-2012' });
    expect(within(dialog).getByText('sara.khan@example.com')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exports the filtered orders as CSV', async () => {
    stubApi();
    renderOrders();
    await screen.findByRole('table');
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'cancelled');
    await user.click(screen.getByRole('button', { name: /export csv \(3\)/i }));

    expect(downloadCsv).toHaveBeenCalledTimes(1);
    const [filename, csv] = vi.mocked(downloadCsv).mock.calls[0];
    expect(filename).toMatch(/^orders-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(csv.split('\r\n')).toHaveLength(4); // header + 3 cancelled orders
  });

  it('shows an error with Retry, then recovers', async () => {
    const state = { fail: true };
    stubApi(state);
    renderOrders();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the orders');

    state.fail = false;
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});
