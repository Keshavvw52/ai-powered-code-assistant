// src/components/Navbar.tsx
import React from 'react';
import {
  Code2, Zap, Shield, BookOpen, FileText, TestTube,
  ArrowLeftRight, Wrench, User, LogOut, Plus, History
} from 'lucide-react';
import { useAuthStore, useEditorStore } from '../store';
import type { AIPanel } from '../types';
import toast from 'react-hot-toast';

interface NavbarProps {
  onShowHistory: () => void;
}

const PANEL_BUTTONS: { panel: AIPanel; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { panel: 'generate', icon: <Zap size={14} />, label: 'Generate', shortcut: '⌃⇧G' },
  { panel: 'review', icon: <Shield size={14} />, label: 'Review', shortcut: '⌃⇧R' },
  { panel: 'explain', icon: <BookOpen size={14} />, label: 'Explain', shortcut: '⌃⇧E' },
  { panel: 'docs', icon: <FileText size={14} />, label: 'Docs', shortcut: '⌃⇧D' },
  { panel: 'tests', icon: <TestTube size={14} />, label: 'Tests', shortcut: '⌃⇧T' },
  { panel: 'translate', icon: <ArrowLeftRight size={14} />, label: 'Translate', shortcut: '' },
  { panel: 'refactor', icon: <Wrench size={14} />, label: 'Refactor', shortcut: '' },
];

export default function Navbar({ onShowHistory }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const { activePanel, setActivePanel, addTab } = useEditorStore();

  return (
    <div className="flex items-center justify-between h-9 px-3 shrink-0" style={{ background: '#323233', borderBottom: '1px solid #252526' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#007acc' }}>
          <Code2 size={12} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-white hidden sm:block">AI Code Assistant</span>
      </div>

      {/* AI Action buttons */}
      <div className="flex items-center gap-0.5 flex-1">
        {PANEL_BUTTONS.map(({ panel, icon, label, shortcut }) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            title={shortcut ? `${label} (${shortcut})` : label}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
            style={{
              background: activePanel === panel ? '#37373d' : 'transparent',
              color: activePanel === panel ? '#fff' : '#bbb',
            }}
            onMouseEnter={(e) => { if (activePanel !== panel) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { if (activePanel !== panel) (e.currentTarget as HTMLElement).style.color = '#bbb'; }}
          >
            {icon}
            <span className="hidden md:block">{label}</span>
          </button>
        ))}

        <div className="w-px h-4 mx-1" style={{ background: '#3c3c3c' }} />

        <button
          onClick={() => addTab()}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white transition-colors"
          title="New Tab"
        >
          <Plus size={14} />
          <span className="hidden md:block">New</span>
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowHistory}
          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="History"
        >
          <History size={15} />
        </button>

        <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid #3c3c3c' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ background: '#007acc' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-300 hidden sm:block">{user?.name}</span>
          </div>
          <button
            onClick={() => { logout(); toast.success('Signed out'); }}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
