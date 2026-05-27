import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Copy,
  Zap,
} from 'lucide-react';
import { useEditorStore } from '../store';
import { getLangMeta, LANGUAGES } from '../lib/languages';
import type { AIPanel, Complexity, Language, ReviewIssue, ReviewResult } from '../types';
import ReviewPanel from './ai/ReviewPanel';
import ExplainPanel from './ai/ExplainPanel';
import DocsPanel from './ai/DocsPanel';
import TestsPanel from './ai/TestsPanel';
import TranslatePanel from './ai/TranslatePanel';
import RefactorPanel from './ai/RefactorPanel';

interface RightPanelProps {
  generatedCode: string;
  generateLanguage: Language;
  generateComplexity: Complexity;
  generatePrompt: string;
  isGenerating: boolean;
  generationDurationLabel: string | null;
  generationStarted: boolean;
  onGenerateLanguageChange: (language: Language) => void;
  onGenerateComplexityChange: (complexity: Complexity) => void;
  onGeneratePromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onInsertGeneratedCode: () => void;
  onDownloadGeneratedCode: () => void;
  onCopyGeneratedCode: () => void;
  onIssuesChange: (issues: ReviewIssue[]) => void;
  onReviewResultChange: (result: ReviewResult | null) => void;
}

const COMPLEXITIES: Complexity[] = ['snippet', 'function', 'module', 'boilerplate'];

export default function RightPanel({
  generatedCode,
  generateLanguage,
  generateComplexity,
  generatePrompt,
  isGenerating,
  generationDurationLabel,
  generationStarted,
  onGenerateLanguageChange,
  onGenerateComplexityChange,
  onGeneratePromptChange,
  onGenerate,
  onInsertGeneratedCode,
  onDownloadGeneratedCode,
  onCopyGeneratedCode,
  onIssuesChange,
  onReviewResultChange,
}: RightPanelProps) {
  const { activePanel } = useEditorStore();
  const [copyFlash, setCopyFlash] = useState(false);
  const meta = getLangMeta(generateLanguage);

  const previewFilename = useMemo(() => `generated.${meta.ext}`, [meta.ext]);

  const activeWorkspace = (() => {
    switch (activePanel) {
      case 'review':
        return <ReviewPanel onIssuesChange={onIssuesChange} onResultChange={onReviewResultChange} />;
      case 'explain':
        return <ExplainPanel />;
      case 'docs':
        return <DocsPanel />;
      case 'tests':
        return <TestsPanel />;
      case 'translate':
        return <TranslatePanel />;
      case 'refactor':
        return <RefactorPanel />;
      default:
        return null;
    }
  })();

  return (
    <aside
      className="w-[470px] shrink-0 border-l p-4 flex flex-col gap-4"
      style={{ background: '#111626', borderColor: '#262b42' }}
    >
      {activePanel === 'generate' ? (
        <section className="rounded-2xl border flex flex-col overflow-hidden flex-1 min-h-0" style={{ background: '#101727', borderColor: '#262b42' }}>
          <div className="p-4 border-b space-y-3" style={{ borderColor: '#262b42' }}>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Generate</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={generateLanguage}
                  onChange={(e) => onGenerateLanguageChange(e.target.value as Language)}
                  className="appearance-none rounded-xl border pl-4 pr-10 h-11 w-full text-sm text-slate-100"
                  style={{ background: '#0f1425', borderColor: '#303752' }}
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
              <div className="relative">
                <select
                  value={generateComplexity}
                  onChange={(e) => onGenerateComplexityChange(e.target.value as Complexity)}
                  className="appearance-none rounded-xl border pl-4 pr-10 h-11 w-full text-sm capitalize text-slate-100"
                  style={{ background: '#0f1425', borderColor: '#303752' }}
                >
                  {COMPLEXITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
            <textarea
              value={generatePrompt}
              onChange={(e) => onGeneratePromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onGenerate();
              }}
              placeholder="Create a binary search function in Python"
              rows={4}
              className="w-full rounded-xl border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
              style={{ background: '#0f1425', borderColor: '#303752' }}
            />
            <button
              onClick={onGenerate}
              className="h-11 rounded-xl px-5 text-sm font-semibold text-white flex items-center justify-center gap-2 w-full"
              style={{ background: isGenerating ? '#5b21b6' : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
              <span className="rounded-lg border px-2 py-0.5 text-[11px]" style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)' }}>
                ⌘K
              </span>
            </button>
          </div>

          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#262b42' }}>
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Generation Result</div>
              <div className="mt-1 text-sm text-slate-300 capitalize">{generateComplexity} output preview</div>
            </div>
            <div className="flex items-center gap-2">
              {(generationStarted || isGenerating) && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5"
                  style={{ background: generationStarted && !isGenerating ? 'rgba(16,185,129,0.14)' : 'rgba(124,58,237,0.18)', color: generationStarted && !isGenerating ? '#6ee7b7' : '#c4b5fd' }}
                >
                  {generationStarted && !isGenerating ? <Check size={13} /> : <Zap size={13} />}
                  {generationStarted && !isGenerating ? 'Completed' : 'Streaming'}
                </span>
              )}
              {generationDurationLabel && <span className="text-xs text-slate-500">{generationDurationLabel}</span>}
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1324', borderColor: '#28314d' }}>
              <div className="h-11 border-b px-3 flex items-center justify-between" style={{ borderColor: '#28314d' }}>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span>{previewFilename}</span>
                </div>
                <button
                  onClick={() => {
                    onCopyGeneratedCode();
                    setCopyFlash(true);
                    setTimeout(() => setCopyFlash(false), 900);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {copyFlash ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <pre className="max-h-[420px] overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words text-slate-200">
                {generatedCode || '// Generated code will appear here'}
              </pre>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={onInsertGeneratedCode}
                disabled={!generatedCode}
                className="rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
              >
                Insert to Editor
              </button>
              <button
                onClick={onDownloadGeneratedCode}
                disabled={!generatedCode}
                className="rounded-xl border py-3 text-sm font-semibold text-slate-100 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ borderColor: '#344064', background: '#141b2d' }}
              >
                <ArrowDownToLine size={15} />
                Download
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border overflow-hidden flex-1 min-h-0" style={{ background: '#101727', borderColor: '#262b42' }}>
          {activeWorkspace}
        </section>
      )}
    </aside>
  );
}
