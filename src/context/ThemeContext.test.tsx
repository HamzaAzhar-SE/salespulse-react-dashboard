import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from './ThemeContext';

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

const isDark = () => document.documentElement.classList.contains('dark');

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  vi.unstubAllGlobals();
});

describe('dark mode', () => {
  it('starts in light mode when nothing is saved', () => {
    renderToggle();
    expect(isDark()).toBe(false);
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('switches to dark mode, saves the choice, and switches back', async () => {
    renderToggle();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(isDark()).toBe(true);
    expect(localStorage.getItem('salespulse.theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Light mode' }));
    expect(isDark()).toBe(false);
    expect(localStorage.getItem('salespulse.theme')).toBe('light');
  });

  it('uses the saved choice when the page loads', () => {
    localStorage.setItem('salespulse.theme', 'dark');
    renderToggle();
    expect(isDark()).toBe(true);
  });

  it('follows the computer setting when nothing is saved', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    renderToggle();
    expect(isDark()).toBe(true);
  });
});
