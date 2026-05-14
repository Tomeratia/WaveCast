import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginApi, registerApi } from '../services/authClient';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result =
        mode === 'login'
          ? await loginApi(email, password)
          : await registerApi(email, name, password);
      login(result.user, result.accessToken);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Something went wrong. Try again.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Waves className="mx-auto mb-3 h-10 w-10 text-ocean-400" />
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Sign in to WaveCast' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {mode === 'login'
              ? 'Access your favourites and surf alerts'
              : 'Free forever — no credit card needed'}
          </p>
        </div>

        <div className={`rounded-xl border bg-gray-900 p-8 shadow-xl transition-colors ${error ? 'border-red-700' : 'border-gray-700'} ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 border border-red-700">
              <span className="mt-0.5 text-red-400">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white placeholder-gray-500 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@example.com"
                className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-ocean-500 focus:ring-ocean-500'}`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                className={`w-full rounded-lg border bg-gray-800 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-ocean-500 focus:ring-ocean-500'}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ocean-500 py-2.5 font-semibold text-white transition hover:bg-ocean-600 disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="text-ocean-400 hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
