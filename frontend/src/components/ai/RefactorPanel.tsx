import React, { useState } from 'react';
import { Wrench, Loader2, ChevronDown, ChevronRight, TrendingDown } from 'lucide-react';
import { useEditorStore } from '../../store';
import { api } from '../../lib/api';
import type { RefactorResult } from '../../types';
import toast from 'react-hot-toast';

export default function RefactorPanel() {
  const { getActiveTab, updateTabContent, activeTabId } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const runRefactor = async () => {
    const tab = getActiveTab();
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    setLoading(true);
    setResult(null);
    try {
      const data = await api.refactor({ language: tab.language, code: tab.content });
      setResult(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFix = (afterCode: string) => {
    updateTabContent(activeTabId, afterCode);
    toast.success('Refactoring applied');
  };

  const toggle = (id: string) => setExpanded((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        <button
          onClick={runRefactor}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Wrench size={13} />}
          {loading ? 'Analyzing...' : 'Analyze & Suggest Refactoring'}
        </button>
      </div>

      {result && (
        <div className="flex-1 overflow-auto">
          {/* Summary */}
          <div className="p-3" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <div className="text-xs text-gray-400 mb-3">{result.summary}</div>
            {/* Metrics */}
            {result.metrics && (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(result.metrics.before).map(([key, val]) => {
                  const after = result.metrics.after[key as keyof typeof result.metrics.after];
                  const improved = after < val;
                  return (
                    <div key={key} className="p-2 rounded text-center" style={{ background: '#2d2d2d' }}>
                      <div className="text-xs text-gray-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-semibold text-gray-300">{val}</span>
                        <TrendingDown size={10} style={{ color: improved ? '#89d185' : '#f48771' }} />
                        <span className="text-sm font-semibold" style={{ color: improved ? '#89d185' : '#f48771' }}>{after}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="divide-y" style={{ borderColor: '#2d2d2d' }}>
            {result.suggestions?.map((s) => (
              <div key={s.id}>
                <button
                  onClick={() => toggle(s.id)}
                  className="w-full flex items-start gap-2 p-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <Wrench size={12} className="mt-0.5 shrink-0" style={{ color: '#007acc' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white mb-0.5">{s.title}</div>
                    <div className="text-xs text-gray-500 truncate">{s.description}</div>
                  </div>
                  {expanded.has(s.id)
                    ? <ChevronDown size={12} className="text-gray-500 shrink-0" />
                    : <ChevronRight size={12} className="text-gray-500 shrink-0" />}
                </button>

                {expanded.has(s.id) && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="text-xs text-gray-400">{s.description}</div>
                    {s.beforeCode && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Before:</div>
                        <pre className="p-2 rounded text-xs font-mono overflow-x-auto" style={{ background: '#1a0000', color: '#f48771', border: '1px solid #3a1a1a' }}>
                          {s.beforeCode}
                        </pre>
                      </div>
                    )}
                    {s.afterCode && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">After:</div>
                        <pre className="p-2 rounded text-xs font-mono overflow-x-auto" style={{ background: '#001a00', color: '#89d185', border: '1px solid #1a3a1a' }}>
                          {s.afterCode}
                        </pre>
                      </div>
                    )}
                    {s.afterCode && (
                      <button
                        onClick={() => applyFix(s.afterCode)}
                        className="w-full py-1.5 rounded text-xs font-medium text-white"
                        style={{ background: '#007acc' }}
                      >
                        Apply This Refactoring
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {(!result.suggestions || result.suggestions.length === 0) && (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm text-gray-400">Code looks clean!</div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Wrench size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Get refactoring suggestions</div>
            <div className="text-xs text-gray-600">with before/after diffs</div>
          </div>
        </div>
      )}
    </div>
  );
}
