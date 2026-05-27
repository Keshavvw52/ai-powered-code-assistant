// src/components/panels/ExplainPanel.tsx
import React, { useState } from 'react';
import { BookOpen, Loader2, Clock, Database } from 'lucide-react';
import { useEditorStore } from '../../store';
import { api } from '../../lib/api';
import type { ExplainDepth, ExplainResult } from '../../types';
import toast from 'react-hot-toast';

const DEPTHS: ExplainDepth[] = ['beginner', 'intermediate', 'expert'];

export default function ExplainPanel() {
  const { getActiveTab } = useEditorStore();
  const [depth, setDepth] = useState<ExplainDepth>('intermediate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const runExplain = async () => {
    const tab = getActiveTab();
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    setLoading(true);
    setResult(null);
    try {
      const data = await api.explain({ language: tab.language, code: tab.content, depth });
      setResult(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        {/* Depth selector */}
        <div className="flex gap-1">
          {DEPTHS.map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className="flex-1 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background: depth === d ? '#007acc' : '#2d2d2d',
                color: depth === d ? '#fff' : '#999',
                border: '1px solid ' + (depth === d ? '#007acc' : '#3c3c3c'),
              }}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={runExplain}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <BookOpen size={13} />}
          {loading ? 'Explaining...' : 'Explain Code'}
        </button>
      </div>

      {result && (
        <div className="flex-1 overflow-auto p-3 space-y-4">
          {/* Overview */}
          <div>
            <div className="text-xs font-medium text-gray-300 mb-1.5">Overview</div>
            <div className="text-xs text-gray-400 leading-relaxed p-2 rounded" style={{ background: '#2d2d2d' }}>
              {result.overview}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <div className="text-xs font-medium text-gray-300 mb-1.5">Explanation</div>
            <div className="text-xs text-gray-400 leading-relaxed">{result.explanation}</div>
          </div>

          {/* Complexity */}
          {result.complexity && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Complexity Analysis</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded" style={{ background: '#2d2d2d' }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={11} style={{ color: '#007acc' }} />
                    <span className="text-xs text-gray-500">Time</span>
                  </div>
                  <div className="text-sm font-mono font-semibold text-white">{result.complexity.time}</div>
                </div>
                <div className="p-2 rounded" style={{ background: '#2d2d2d' }}>
                  <div className="flex items-center gap-1 mb-1">
                    <Database size={11} style={{ color: '#007acc' }} />
                    <span className="text-xs text-gray-500">Space</span>
                  </div>
                  <div className="text-sm font-mono font-semibold text-white">{result.complexity.space}</div>
                </div>
              </div>
              {result.complexity.notes && (
                <div className="text-xs text-gray-500 mt-2">{result.complexity.notes}</div>
              )}
            </div>
          )}

          {/* Algorithm */}
          {result.algorithm && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Algorithm</div>
              <div className="px-2 py-1 rounded inline-block text-xs font-mono" style={{ background: 'rgba(0,122,204,0.15)', color: '#007acc', border: '1px solid rgba(0,122,204,0.3)' }}>
                {result.algorithm}
              </div>
            </div>
          )}

          {/* Parameters */}
          {result.parameters?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Parameters</div>
              <div className="space-y-1.5">
                {result.parameters.map((p, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <code className="font-mono px-1 rounded shrink-0" style={{ background: '#2d2d2d', color: '#9cdcfe' }}>{p.name}</code>
                    <code className="text-gray-600 shrink-0">{p.type}</code>
                    <span className="text-gray-400">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Returns */}
          {result.returns && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Returns</div>
              <div className="text-xs text-gray-400">{result.returns}</div>
            </div>
          )}

          {/* Line annotations */}
          {result.lineAnnotations?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Line-by-Line</div>
              <div className="space-y-1.5">
                {result.lineAnnotations.map((ann, i) => (
                  <div key={i} className="flex gap-2 text-xs p-2 rounded" style={{ background: '#2d2d2d' }}>
                    <span className="font-mono text-gray-600 shrink-0 w-8">L{ann.line}</span>
                    <span className="text-gray-400">{ann.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example usage */}
          {result.exampleUsage && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-1.5">Example Usage</div>
              <pre className="p-2 rounded text-xs font-mono overflow-x-auto" style={{ background: '#1a1a1a', color: '#d4d4d4' }}>
                {result.exampleUsage}
              </pre>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <BookOpen size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Get a plain-English explanation</div>
            <div className="text-xs text-gray-600">at any skill level</div>
            <div className="text-xs text-gray-700 mt-1">⌃⇧E to start</div>
          </div>
        </div>
      )}
    </div>
  );
}
