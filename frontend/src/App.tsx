// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store';
import { api } from './lib/api';
import AuthShellPage from './pages/AuthShellPage';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';

type GuestView = 'home' | 'login' | 'signup';
type AppView = 'home' | 'dashboard';

export default function App() {
  const { isAuthenticated, login, token } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [guestView, setGuestView] = useState<GuestView>('home');
  const [appView, setAppView] = useState<AppView>('dashboard');

  useEffect(() => {
    // Verify stored token on mount
    if (token) {
      api.auth.me()
        .then(({ user }) => {
          login(user, token);
          setAppView('dashboard');
        })
        .catch(() => useAuthStore.getState().logout())
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#1e1e1e' }}>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm">Loading AI Code Assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#0f1425', color: '#EDEDEF', border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px' },
          success: { iconTheme: { primary: '#34d399', secondary: '#0f1425' } },
          error: { iconTheme: { primary: '#fb7185', secondary: '#0f1425' } },
        }}
      />
      {isAuthenticated ? (
        appView === 'home' ? (
          <HomePage
            onGetStarted={() => setAppView('dashboard')}
            onSignIn={() => setAppView('dashboard')}
          />
        ) : (
          <Dashboard onGoHome={() => setAppView('home')} />
        )
      ) : guestView === 'home' ? (
        <HomePage
          onGetStarted={() => setGuestView('signup')}
          onSignIn={() => setGuestView('login')}
        />
      ) : (
        <AuthShellPage
          initialMode={guestView === 'signup' ? 'signup' : 'login'}
          onBack={() => setGuestView('home')}
        />
      )}
    </>
  );
}
