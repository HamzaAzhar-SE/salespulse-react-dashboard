import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_USER, validateLogin, type LoginErrors } from '../lib/auth';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const found = validateLogin({ email, password });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-brand-600">SalesPulse</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClass}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Demo account: <strong>{DEMO_USER.email}</strong> / <strong>{DEMO_USER.password}</strong>
        </p>
      </div>
    </main>
  );
}
