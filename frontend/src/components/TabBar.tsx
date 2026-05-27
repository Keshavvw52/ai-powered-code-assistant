// src/components/TabBar.tsx
import React from 'react';
import { Copy, Expand, Play, Plus, X } from 'lucide-react';
import { useEditorStore } from '../store';
import { getLangMeta } from '../lib/languages';
import toast from 'react-hot-toast';

interface TabBarProps {
  onToggleFullscreen: () => void;
  onRun: () => void;
}

export default function TabBar({ onToggleFullscreen, onRun }: TabBarProps) {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useEditorStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div
      className="h-12 shrink-0 border-b px-4 flex items-center justify-between gap-3"
      style={{ background: '#101727', borderColor: '#262b42' }}
    >
      <div className="flex items-center gap-2 overflow-x-auto min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const meta = getLangMeta(tab.language);

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-3 h-9 cursor-pointer shrink-0 rounded-t-xl relative group border"
              style={{
                background: isActive ? '#141b2d' : '#0f1425',
                color: isActive ? '#fff' : '#9da4c4',
                borderColor: isActive ? '#323d5f' : '#202844',
              }}
            >
              {isActive && (
                <span
                  className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' }}
                />
              )}
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
              <span className="text-xs truncate flex-1 max-w-[160px]">{tab.title}</span>
              {tab.isDirty && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                className="opacity-0 group-hover:opacity-100 hover:text-white p-0.5 rounded transition-all"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => addTab()}
          className="h-9 w-9 rounded-xl border flex items-center justify-center text-slate-300 shrink-0"
          style={{ background: '#0f1425', borderColor: '#202844' }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRun}
          className="h-9 rounded-xl border px-3 text-sm text-slate-100 flex items-center gap-2"
          style={{ background: '#141b2d', borderColor: '#344064' }}
        >
          <Play size={14} />
          Run
        </button>
        <button
          onClick={() => {
            if (!activeTab?.content) return;
            navigator.clipboard.writeText(activeTab.content);
            toast.success('Copied editor content');
          }}
          className="h-9 w-9 rounded-xl border flex items-center justify-center text-slate-300"
          style={{ background: '#141b2d', borderColor: '#344064' }}
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onToggleFullscreen}
          className="h-9 w-9 rounded-xl border flex items-center justify-center text-slate-300"
          style={{ background: '#141b2d', borderColor: '#344064' }}
        >
          <Expand size={14} />
        </button>
      </div>
    </div>
  );
}
