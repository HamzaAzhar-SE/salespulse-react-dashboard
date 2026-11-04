import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/orders', label: 'Orders', end: false },
  { to: '/customers', label: 'Customers', end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  // The skip link moves keyboard focus straight to the page content.
  function skipToContent(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-brand-700 focus:shadow-lg dark:focus:bg-slate-800 dark:focus:text-brand-100"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <span className="text-lg font-bold text-brand-600 dark:text-brand-500">SalesPulse</span>

          {/* On a phone: brand and buttons on the first row, links on the second row. */}
          <div className="flex items-center gap-2 text-sm sm:order-3 sm:gap-3">
            <span className="hidden text-slate-500 dark:text-slate-400 lg:inline">{user?.email}</span>
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Log out
            </button>
          </div>

          <nav aria-label="Main" className="flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}
