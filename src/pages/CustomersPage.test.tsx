import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { stubApi } from '../test/fixtures';
import { renderWithProviders } from '../test/utils';
import CustomersPage from './CustomersPage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CustomersPage', () => {
  it('shows a skeleton first, then a card for every customer', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    expect(screen.getByRole('status', { name: 'Loading customers' })).toBeInTheDocument();

    expect(await screen.findByRole('link', { name: 'Ali Raza' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sara Khan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zain Abbas' })).toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 3 customers')).toBeInTheDocument();
  });

  it('links each customer to the detail page', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    expect(await screen.findByRole('link', { name: 'Ali Raza' })).toHaveAttribute('href', '/customers/c1');
  });

  it('shows money and order counts without cancelled orders', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    const card = (await screen.findByRole('link', { name: 'Ali Raza' })).closest('li')!;
    expect(within(card).getByText('$400')).toBeInTheDocument();
    expect(within(card).getByText('Oct 12, 2026')).toBeInTheDocument();
  });

  it('switches between the card view and the table view', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    await screen.findByRole('link', { name: 'Ali Raza' });
    const user = userEvent.setup();

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Table' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 customers
    expect(screen.getByRole('button', { name: 'Table' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('searches by name', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    await screen.findByRole('link', { name: 'Ali Raza' });

    await userEvent.setup().type(screen.getByLabelText('Search customers'), 'sara');
    expect(screen.getByRole('link', { name: 'Sara Khan' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ali Raza' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 customers')).toBeInTheDocument();
  });

  it('sorts the newest customers first', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    await screen.findByRole('link', { name: 'Ali Raza' });

    await userEvent.setup().selectOptions(screen.getByLabelText('Sort by'), 'joinedAt');
    const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(names).toEqual(['Zain Abbas', 'Sara Khan', 'Ali Raza']);
  });

  it('shows an empty state and clears the search', async () => {
    stubApi();
    renderWithProviders(<CustomersPage />);
    await screen.findByRole('link', { name: 'Ali Raza' });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Search customers'), 'zzzz');
    expect(screen.getByText('No customers match your search.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('link', { name: 'Ali Raza' })).toBeInTheDocument();
  });

  it('shows an error with Retry, then recovers', async () => {
    const state = { fail: true };
    stubApi(state);
    renderWithProviders(<CustomersPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the customers');

    state.fail = false;
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('link', { name: 'Ali Raza' })).toBeInTheDocument();
  });
});
