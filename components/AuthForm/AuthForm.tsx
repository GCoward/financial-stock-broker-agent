'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'signup';

/**
 * AuthForm handles both login and sign-up flows via a tab toggle.
 * On successful login it stores the JWT and redirects to the dashboard.
 *
 * ! CRITICAL: Sign-up is a UI stub — wire to a real /api/auth/register
 *   endpoint with bcrypt password hashing before production use.
 */
export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
      // TODO: POST to /api/auth/register
      setError('Sign-up is not yet available. Please use the demo account.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { token?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Login failed.');
        return;
      }

      // ? Store token in sessionStorage so it is cleared when the tab closes.
      sessionStorage.setItem('token', data.token!);
      router.push('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';

  return (
    <div className="w-full max-w-sm">
      {/* Mode tabs */}
      <div role="tablist" aria-label="Authentication mode" className="mb-6 flex rounded-xl bg-slate-800 p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500
              ${mode === m ? 'bg-slate-900 text-slate-50 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {m === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-950/60 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            aria-required="true"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-confirm" className="mb-1 block text-sm font-medium text-slate-300">
              Confirm Password
            </label>
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-sky-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        {mode === 'login' ? (
          <>No account?{' '}
            <button onClick={() => setMode('signup')} className="text-sky-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded">
              Sign up
            </button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-sky-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded">
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
