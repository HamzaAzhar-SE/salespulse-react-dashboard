import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEMO_USER } from './lib/auth';
import { renderApp } from './test/utils';

beforeEach(() => {
  localStorage.clear();
});

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  return user;
}

describe('protected routes', () => {
  it('redirects a logged-out visitor from /orders to the login page', async () => {
    renderApp('/orders');
    expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Orders' })).not.toBeInTheDocument();
  });

  it('lets a logged-in visitor open /orders directly', async () => {
    localStorage.setItem(
      'salespulse.user',
      JSON.stringify({ name: DEMO_USER.name, email: DEMO_USER.email }),
    );
    renderApp('/orders');
    expect(await screen.findByRole('heading', { name: 'Orders' })).toBeInTheDocument();
  });
});

describe('login form', () => {
  it('shows validation errors when the form is empty', async () => {
    renderApp('/login');
    await fillAndSubmit('', '');
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows an error for a wrong password', async () => {
    renderApp('/login');
    await fillAndSubmit(DEMO_USER.email, 'wrong-password');
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('logs in with the demo account and shows the dashboard', async () => {
    renderApp('/login');
    await fillAndSubmit(DEMO_USER.email, DEMO_USER.password);
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('logs out and returns to the login page', async () => {
    renderApp('/login');
    const user = await fillAndSubmit(DEMO_USER.email, DEMO_USER.password);
    await screen.findByRole('heading', { name: 'Dashboard' });
    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
  });
});
