// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { Code2, Zap, Shield, GitBranch } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
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
    <div className="h-full flex" style={{ background: '#1e1e1e' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: '#252526', borderRight: '1px solid #3c3c3c' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#007acc' }}>
            <Code2 size={18} className="text-white" />
          </div>
          <span className="font-semibold text-white">AI Code Assistant</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your AI-powered<br />
            <span style={{ color: '#007acc' }}>coding companion</span>
          </h1>
          <p className="text-gray-400 text-base mb-8">
            Generate, review, explain, test, and translate code across 7 languages with intelligent AI assistance.
          </p>

          <div className="space-y-4">
            {[
              { icon: Zap, label: 'Code Generation', desc: 'Natural language → production code' },
              { icon: Shield, label: 'Code Review', desc: 'Bugs, security, performance analysis' },
              { icon: GitBranch, label: 'Multi-Language', desc: 'Python, JS, TS, Go, Java, Rust, C++' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(0,122,204,0.15)', border: '1px solid rgba(0,122,204,0.3)' }}>
                  <Icon size={14} style={{ color: '#007acc' }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 font-mono">
          Powered by Google Gemini AI
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#007acc' }}>
              <Code2 size={18} className="text-white" />
            </div>
            <span className="font-semibold text-white">AI Code Assistant</span>
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="hover:underline"
              style={{ color: '#007acc' }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="your name"
                  required
                  className="w-full px-3 py-2 rounded text-sm text-white placeholder-gray-600 focus:outline-none"
                  style={{ background: '#2d2d2d', border: '1px solid #3c3c3c' }}
                  onFocus={(e) => e.target.style.borderColor = '#007acc'}
                  onBlur={(e) => e.target.style.borderColor = '#3c3c3c'}
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 rounded text-sm text-white placeholder-gray-600 focus:outline-none"
                style={{ background: '#2d2d2d', border: '1px solid #3c3c3c' }}
                onFocus={(e) => e.target.style.borderColor = '#007acc'}
                onBlur={(e) => e.target.style.borderColor = '#3c3c3c'}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
                required
                className="w-full px-3 py-2 rounded text-sm text-white placeholder-gray-600 focus:outline-none"
                style={{ background: '#2d2d2d', border: '1px solid #3c3c3c' }}
                onFocus={(e) => e.target.style.borderColor = '#007acc'}
                onBlur={(e) => e.target.style.borderColor = '#3c3c3c'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: loading ? '#005a9e' : '#007acc' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 p-3 rounded text-xs text-gray-500 font-mono" style={{ background: '#2d2d2d', border: '1px solid #3c3c3c' }}>
            <div className="text-gray-400 mb-1">Quick test:</div>
            <div>email: demo@example.com</div>
            <div>password: demo1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
