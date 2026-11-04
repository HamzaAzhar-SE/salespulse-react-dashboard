import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { stubApi } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import CustomerDetailPage from './CustomerDetailPage';

function renderDetail(customerId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
    </Routes>,
    `/customers/${customerId}`,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CustomerDetailPage', () => {
  it('shows a skeleton first, then the customer and their numbers', async () => {
    stubApi();
    renderDetail('c1');
    expect(screen.getByRole('status', { name: 'Loading customer' })).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Ali Raza', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/ali\.raza@example\.com/)).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Orders' })).getByText('2')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Total spent' })).getByText('$400')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Average order value' })).getByText('$200')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Last order' })).getByText('Oct 12, 2026')).toBeInTheDocument();
  });

  it('lists the order history newest first, including cancelled orders', async () => {
    stubApi();
    renderDetail('c1');
    await screen.findByRole('heading', { name: 'Ali Raza', level: 1 });

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('ORD-3003')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Cancelled')).toBeInTheDocument();
    expect(within(rows[2]).getByText('ORD-3001')).toBeInTheDocument();
  });

  it('shows a friendly message for a customer with no orders', async () => {
    stubApi();
    renderDetail('c3');
    expect(await screen.findByText('This customer has no orders yet.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows "Customer not found" for an unknown ID, with a way back', async () => {
    stubApi();
    renderDetail('c99');
    expect(await screen.findByRole('heading', { name: 'Customer not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to all customers' })).toHaveAttribute('href', '/customers');
  });

  it('shows an error with Retry, then recovers', async () => {
    const state = { fail: true };
    stubApi(state);
    renderDetail('c1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this customer');

    state.fail = false;
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: 'Ali Raza', level: 1 })).toBeInTheDocument();
  });
});
