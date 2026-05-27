// src/components/StatusBar.tsx
import React from 'react';
import { useEditorStore } from '../store';
import { getLangMeta } from '../lib/languages';

interface StatusBarProps {
  cursor: { lineNumber: number; column: number };
}

export default function StatusBar({ cursor }: StatusBarProps) {
  const { tabs, activeTabId } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const meta = activeTab ? getLangMeta(activeTab.language) : null;

  return (
    <div
      className="flex items-center justify-between px-4 h-8 text-xs shrink-0 rounded-b-2xl border-t"
      style={{ background: '#0d1324', color: '#a6adcc', borderColor: '#262b42' }}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <span>Ln {cursor.lineNumber}, Col {cursor.column}</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>LF</span>
      </div>
      <div className="flex items-center gap-4">
        {meta && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
            <span>{meta.label}</span>
          </div>
        )}
        <span>{activeTab?.title || 'untitled'}</span>
        <div className="flex items-center gap-2">
          <span>v3.11.5</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>
    </div>
  );
}
