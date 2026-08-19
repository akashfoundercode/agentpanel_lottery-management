import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/axios';
import { Crown, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/agent/login', { email, password });
      const { token } = res.data.data;
      login(token);
      navigate('/agent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(10,18,48,0.86)_48%,rgba(255,255,255,0.92)_48%,rgba(248,250,252,0.98))]" />

      <div className="relative hidden min-h-screen flex-1 items-center px-10 lg:flex">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
            <Sparkles size={15} />
            Premium Agent Access
          </div>
          <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-normal xl:text-5xl">
            Lucky Draw
            <span className="block text-blue-300">Agent Panel</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Manage books, sales, results, assignments, and settlement activity from one polished command center.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              ['25,600', 'Tickets'],
              ['128', 'Books'],
              ['₹18,750', 'Today'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
                <p className="text-xl font-black">{value}</p>
                <p className="mt-1 text-xs text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-8 lg:w-[48%]">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25">
              <Crown className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-slate-950">Welcome Back</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Sign in to your premium lottery agent account.</p>
          </div>

          <form onSubmit={handleLogin} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
            <div className="mb-5 flex items-center gap-2.5 rounded-md bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <ShieldCheck size={16} />
              Secure agent session
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="agent@example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  placeholder="Password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700" aria-label="Toggle password visibility">
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600">{error}</div>
            )}
            <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 font-semibold text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                Remember me
              </label>
              <button type="button" className="font-bold text-blue-600 hover:text-blue-700">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 w-full rounded-md bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition-all duration-300 hover:shadow-blue-600/35 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
