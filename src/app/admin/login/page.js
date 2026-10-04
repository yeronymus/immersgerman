'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        // Successful login, redirect to configured admin route
        const configuredAdminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
        router.push(configuredAdminPath);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-obsidian text-foreground">
      <div className="max-w-md w-full space-y-8 glass-panel rounded-2xl p-8 shadow-2xl border border-card-border relative overflow-hidden">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Secure Admin Entry
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter the dashboard verification password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-200 text-sm p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-800 bg-slate-950/50 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Enter password..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-cyan-500/30 text-sm font-medium rounded-xl text-cyan-200 bg-cyan-950/20 hover:bg-cyan-950/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 cursor-pointer shadow-lg hover:shadow-cyan-500/10 transition-all disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-cyan-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
