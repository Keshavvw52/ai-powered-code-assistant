import React from 'react';
import {
  Bot,
  FileClock,
  FileText,
  Gauge,
  Home,
  History,
  Languages,
  LogOut,
  ShieldCheck,
  TestTube2,
  Wand2,
  BookOpenText,
} from 'lucide-react';
import { useAuthStore, useEditorStore } from '../store';
import type { AIPanel } from '../types';
import toast from 'react-hot-toast';

const NAV_ITEMS: Array<{
  id: string;
  label: string;
  icon: React.ReactNode;
  panel?: AIPanel;
}> = [
  { id: 'home', label: 'Home', icon: <Home size={16} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <Gauge size={16} /> },
  { id: 'review', label: 'Code Review', icon: <ShieldCheck size={16} />, panel: 'review' },
  { id: 'explain', label: 'Explain Code', icon: <BookOpenText size={16} />, panel: 'explain' },
  { id: 'docs', label: 'Documentation', icon: <FileText size={16} />, panel: 'docs' },
  { id: 'tests', label: 'Unit Tests', icon: <TestTube2 size={16} />, panel: 'tests' },
  { id: 'translate', label: 'Translate Code', icon: <Languages size={16} />, panel: 'translate' },
  { id: 'refactor', label: 'Refactor Code', icon: <Wand2 size={16} />, panel: 'refactor' },
  { id: 'history', label: 'History', icon: <History size={16} /> },
];

interface SidebarProps {
  onShowHistory: () => void;
  onGoHome: () => void;
}

export default function Sidebar({ onShowHistory, onGoHome }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { activePanel, setActivePanel, tabs, activeTabId, setActiveTab } = useEditorStore();

  return (
    <aside
      className="w-[220px] shrink-0 border-r px-4 py-5 flex flex-col overflow-y-auto"
      style={{ background: '#111626', borderColor: '#262b42' }}
    >
      <div className="mb-6 flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
        >
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <div className="text-base font-semibold text-white">AI Code Assistant</div>
          <div className="text-xs text-slate-400 leading-relaxed">Your intelligent coding partner</div>
        </div>
      </div>

      <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">Navigation</div>
      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.panel ? activePanel === item.panel : item.id === 'dashboard' && activePanel === 'generate';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'home') {
                  onGoHome();
                  return;
                }

                if (item.id === 'history') {
                  onShowHistory();
                  return;
                }

                if (item.id === 'dashboard') {
                  setActivePanel('generate');
                  return;
                }

                if (item.panel) {
                  setActivePanel(item.panel);
                }
              }}
              className="w-full rounded-xl px-3 py-2.5 text-sm flex items-center gap-3 transition-colors"
              style={{
                background: isActive ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                color: isActive ? '#f5f3ff' : '#a6adcc',
                borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent',
              }}
            >
              <span style={{ color: isActive ? '#a78bfa' : '#8188a8' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-7 mb-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">Recent Sessions</div>
      <div className="space-y-2 pr-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full rounded-xl border px-3 py-2.5 text-left transition-colors"
              style={{
                background: isActive ? 'rgba(99, 102, 241, 0.12)' : '#151a2d',
                borderColor: isActive ? '#7c3aed' : '#262b42',
              }}
            >
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <FileClock size={14} className="text-violet-300" />
                <span className="truncate">{tab.title}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{tab.language}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl border p-3" style={{ background: '#151a2d', borderColor: '#262b42' }}>
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)' }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-white truncate">{user?.name || 'User'}</div>
            <div className="text-[11px] text-slate-500 truncate">{user?.email || 'Signed in'}</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            toast.success('Signed out');
          }}
          className="mt-3 w-full rounded-xl border py-2 text-sm font-medium text-slate-100 flex items-center justify-center gap-2"
          style={{ background: '#101727', borderColor: '#344064' }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
