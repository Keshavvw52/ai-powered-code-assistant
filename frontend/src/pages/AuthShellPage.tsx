import React, { useState } from 'react';
import { ArrowLeft, Bot, GitBranch, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

interface AuthShellPageProps {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
}

const BENEFITS = [
  {
    title: 'Generate with structure',
    description: 'Turn ideas into clean code with prompts shaped for real-world developer tasks.',
    icon: <Sparkles size={16} />,
    accent: '#8b5cf6',
  },
  {
    title: 'Review with clarity',
    description: 'Surface bugs, style issues, and hidden edge cases without leaving your workspace.',
    icon: <ShieldCheck size={16} />,
    accent: '#34d399',
  },
  {
    title: 'Work across languages',
    description: 'Move between Python, JavaScript, TypeScript, Java, Go, Rust, and C++ seamlessly.',
    icon: <GitBranch size={16} />,
    accent: '#60a5fa',
  },
];

export default function AuthShellPage({ initialMode = 'login', onBack }: AuthShellPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { user, token } = await api.auth.signup(form);
        login(user, token);
        toast.success(`Welcome, ${user.name}!`);
      } else {
        const { user, token } = await api.auth.login({ email: form.email, password: form.password });
        login(user, token);
        toast.success(`Welcome back, ${user.name}!`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full overflow-auto bg-[#050506] text-[#EDEDEF]">
      <div className="ambient-grid pointer-events-none absolute inset-0" />
      <div className="ambient-noise pointer-events-none absolute inset-0" />
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-c" />

      <div className="relative mx-auto min-h-full max-w-[1460px] px-5 py-6 sm:px-8 lg:px-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05]"
        >
          <ArrowLeft size={15} />
          Back to home
        </button>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section
            className="relative overflow-hidden rounded-[30px] border p-8 sm:p-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.38)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,106,210,0.2),transparent_38%)]" />
            <div className="relative flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #5E6AD2 0%, #8b5cf6 100%)', boxShadow: '0 12px 30px rgba(94,106,210,0.32)' }}
              >
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">AI Code Assistant</div>
                <div className="text-sm text-slate-500">Precision software for modern developer workflows</div>
              </div>
            </div>

            <div className="relative mt-14">
              <div className="inline-flex items-center rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.22em] text-[#b9c3ff]">
                Secure developer workspace
              </div>
              <h1 className="mt-6 max-w-xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-4xl font-semibold tracking-[-0.03em] text-transparent sm:text-5xl lg:text-6xl">
                Sign in to the premium AI coding environment you just saw.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
                Continue into your dashboard to generate, review, document, test, and refactor code in one focused workspace.
              </p>
            </div>

            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border"
                    style={{ color: item.accent, borderColor: `${item.accent}55`, background: `${item.accent}12` }}
                  >
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</div>
                </div>
              ))}
            </div>

            <div className="relative mt-10 rounded-3xl border border-white/[0.06] bg-[#0b1020]/85 p-5">
              <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Instant access</div>
              <div className="mt-3 text-sm text-slate-300">Use the demo account for a quick walkthrough:</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Email</div>
                  <div className="mt-2 font-mono text-sm text-slate-200">demo@example.com</div>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Password</div>
                  <div className="mt-2 font-mono text-sm text-slate-200">demo1234</div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="relative overflow-hidden rounded-[30px] border p-8 sm:p-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_35%)]" />
            <div className="relative mx-auto w-full max-w-md">
              <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">
                {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {mode === 'login' ? 'Sign in to continue' : 'Open your AI coding workspace'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {mode === 'login'
                  ? 'Use your account to return straight to the dashboard.'
                  : 'Create an account and you will be redirected directly into the dashboard.'}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="w-full rounded-xl border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                      style={{ background: '#0f1425', borderColor: 'rgba(255,255,255,0.10)' }}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    style={{ background: '#0f1425', borderColor: 'rgba(255,255,255,0.10)' }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={mode === 'signup' ? 'Minimum 8 characters' : '••••••••'}
                    required
                    className="w-full rounded-xl border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    style={{ background: '#0f1425', borderColor: 'rgba(255,255,255,0.10)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-white transition disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #5E6AD2 0%, #8b5cf6 100%)',
                    boxShadow: '0 0 0 1px rgba(94,106,210,0.45), 0 18px 50px rgba(94,106,210,0.2)',
                  }}
                >
                  {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-sm text-slate-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-[#b7c0ff] transition hover:text-white"
                >
                  {mode === 'login' ? 'Create one now' : 'Sign in instead'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
