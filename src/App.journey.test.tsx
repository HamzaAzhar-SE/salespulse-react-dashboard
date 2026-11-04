import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_USER } from './lib/auth';
import { stubApi } from './test/fixtures';
import { renderApp } from './test/utils';

beforeEach(() => {
  localStorage.clear();
  stubApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('dark');
});

describe('full user journey', () => {
  it('logs in, browses the dashboard, orders and customers, then logs out', async () => {
    const user = userEvent.setup();
    renderApp('/'); // logged out, so the app sends us to the login page

    // Log in
    await user.type(await screen.findByLabelText('Email'), DEMO_USER.email);
    await user.type(screen.getByLabelText('Password'), DEMO_USER.password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Dashboard: 100 + 300 + 50 (the cancelled order is not counted)
    const revenue = await screen.findByRole('group', { name: 'Total revenue' });
    expect(within(revenue).getByText('$450')).toBeInTheDocument();

    // Orders: 4 orders, then search for one customer
    await user.click(screen.getByRole('link', { name: 'Orders' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5);
    await user.type(screen.getByLabelText('Search orders'), 'sara');
    expect(screen.getAllByRole('row')).toHaveLength(2);

    // Customers: open one customer and see their order history
    await user.click(screen.getByRole('link', { name: 'Customers' }));
    await user.click(await screen.findByRole('link', { name: 'Ali Raza' }));
    expect(await screen.findByRole('heading', { name: 'Ali Raza', level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // header + 3 orders

    // Go back, then log out
    await user.click(screen.getByRole('link', { name: 'Back to all customers' }));
    expect(await screen.findByRole('heading', { name: 'Customers', level: 1 })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
  });
});
