// src/components/AIPanel.tsx
import React from 'react';
import { Zap, Shield, BookOpen, FileText, TestTube, ArrowLeftRight, Wrench } from 'lucide-react';
import { useEditorStore } from '../store';
import type { AIPanel as AIPanelType, ReviewIssue } from '../types';

import GeneratePanel from './ai/GeneratePanel';
import ReviewPanel from './ai/ReviewPanel';
import ExplainPanel from './ai/ExplainPanel';
import DocsPanel from './ai/DocsPanel';
import TestsPanel from './ai/TestsPanel';
import TranslatePanel from './ai/TranslatePanel';
import RefactorPanel from './ai/RefactorPanel';

const PANEL_META: Record<AIPanelType, { label: string; icon: React.ReactNode; shortcut?: string }> = {
  generate: { label: 'Generate', icon: <Zap size={13} />, shortcut: '⌃⇧G' },
  review: { label: 'Review', icon: <Shield size={13} />, shortcut: '⌃⇧R' },
  explain: { label: 'Explain', icon: <BookOpen size={13} />, shortcut: '⌃⇧E' },
  docs: { label: 'Docs', icon: <FileText size={13} />, shortcut: '⌃⇧D' },
  tests: { label: 'Tests', icon: <TestTube size={13} />, shortcut: '⌃⇧T' },
  translate: { label: 'Translate', icon: <ArrowLeftRight size={13} /> },
  refactor: { label: 'Refactor', icon: <Wrench size={13} /> },
};

interface AIPanelProps {
  onIssuesChange: (issues: ReviewIssue[]) => void;
}

export default function AIPanelComponent({ onIssuesChange }: AIPanelProps) {
  const { activePanel, setActivePanel } = useEditorStore();

  const renderPanel = () => {
    switch (activePanel) {
      case 'generate': return <GeneratePanel />;
      case 'review': return <ReviewPanel onIssuesChange={onIssuesChange} />;
      case 'explain': return <ExplainPanel />;
      case 'docs': return <DocsPanel />;
      case 'tests': return <TestsPanel />;
      case 'translate': return <TranslatePanel />;
      case 'refactor': return <RefactorPanel />;
    }
  };

  const meta = PANEL_META[activePanel];

  return (
    <div className="flex flex-col h-full" style={{ borderLeft: '1px solid #3c3c3c' }}>
      {/* Panel header */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ background: '#252526', borderBottom: '1px solid #3c3c3c', height: '35px' }}
      >
        <span style={{ color: '#007acc' }}>{meta.icon}</span>
        <span className="text-xs font-medium text-white">{meta.label}</span>
        {meta.shortcut && (
          <span className="ml-auto text-xs text-gray-600 font-mono">{meta.shortcut}</span>
        )}
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{ background: '#1e1e1e' }}>
        {renderPanel()}
      </div>
    </div>
  );
}
