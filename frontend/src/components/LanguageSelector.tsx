// src/components/LanguageSelector.tsx
import React from 'react';
import { LANGUAGES, getLangMeta } from '../lib/languages';
import type { Language } from '../types';
import { useEditorStore } from '../store';

export default function LanguageSelector() {
  const { tabs, activeTabId, updateTabLanguage } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return null;
  const meta = getLangMeta(activeTab.language);

  return (
    <label className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
      <select
        value={activeTab.language}
        onChange={(e) => updateTabLanguage(activeTabId, e.target.value as Language)}
        className="rounded text-xs px-2 py-1 pr-7 focus:outline-none"
        style={{ background: '#252526', border: '1px solid #3c3c3c', color: '#cccccc' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
