// src/components/panels/ReviewPanel.tsx
import React, { useState } from 'react';
import { Shield, AlertCircle, AlertTriangle, Info, Lightbulb, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store';
import { api } from '../../lib/api';
import type { ReviewResult, ReviewIssue } from '../../types';
import toast from 'react-hot-toast';

interface ReviewPanelProps {
  onIssuesChange: (issues: ReviewIssue[]) => void;
  onResultChange?: (result: ReviewResult | null) => void;
}

const SEVERITY_CONFIG = {
  error: { icon: AlertCircle, color: '#f48771', bg: 'rgba(244,135,113,0.1)', label: 'Error' },
  warning: { icon: AlertTriangle, color: '#cca700', bg: 'rgba(204,167,0,0.1)', label: 'Warning' },
  info: { icon: Info, color: '#75beff', bg: 'rgba(117,190,255,0.1)', label: 'Info' },
  suggestion: { icon: Lightbulb, color: '#89d185', bg: 'rgba(137,209,133,0.1)', label: 'Suggestion' },
};

const GRADE_COLOR: Record<string, string> = {
  A: '#89d185', B: '#89d185', C: '#cca700', D: '#f48771', F: '#f48771',
};

export default function ReviewPanel({ onIssuesChange, onResultChange }: ReviewPanelProps) {
  const { getActiveTab } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const runReview = async () => {
    const tab = getActiveTab();
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    setLoading(true);
    setResult(null);
    onIssuesChange([]);
    onResultChange?.(null);
    try {
      const data = await api.review({ language: tab.language, code: tab.content });
      setResult(data);
      onIssuesChange(data.issues);
      onResultChange?.(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        <button
          onClick={runReview}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
          {loading ? 'Reviewing...' : 'Review Current File'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="flex-1 overflow-auto">
          {/* Summary card */}
          <div className="p-3" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                  style={{ background: `rgba(${hexToRgb(GRADE_COLOR[result.grade])}, 0.15)`, color: GRADE_COLOR[result.grade] }}
                >
                  {result.grade}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Code Quality</div>
                  <div className="text-xs" style={{ color: GRADE_COLOR[result.grade] }}>Score: {result.score}/100</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">{result.issues.length} issues found</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{result.summary}</p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-1 mt-3">
              {Object.entries(result.stats).map(([key, count]) => (
                <div key={key} className="text-center p-1.5 rounded" style={{ background: '#2d2d2d' }}>
                  <div className="text-sm font-semibold text-white">{count}</div>
                  <div className="text-xs text-gray-500 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues list */}
          <div className="divide-y" style={{ borderColor: '#2d2d2d' }}>
            {result.issues.map((issue) => {
              const cfg = SEVERITY_CONFIG[issue.severity];
              const Icon = cfg.icon;
              const isExp = expanded.has(issue.id);

              return (
                <div key={issue.id} style={{ background: isExp ? '#252526' : 'transparent' }}>
                  <button
                    onClick={() => toggleExpand(issue.id)}
                    className="w-full flex items-start gap-2 p-3 text-left hover:bg-gray-800 transition-colors"
                  >
                    <Icon size={13} className="mt-0.5 shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs text-gray-600">Line {issue.line}</span>
                        <span className="text-xs px-1.5 rounded" style={{ background: '#2d2d2d', color: '#999' }}>
                          {issue.category}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 truncate">{issue.description}</div>
                    </div>
                    {isExp ? <ChevronDown size={12} className="text-gray-500 shrink-0" /> : <ChevronRight size={12} className="text-gray-500 shrink-0" />}
                  </button>

                  {isExp && (
                    <div className="px-3 pb-3 ml-5">
                      <div className="text-xs text-gray-400 mb-2">{issue.suggestion}</div>
                      {issue.fixCode && (
                        <pre className="p-2 rounded text-xs font-mono overflow-x-auto" style={{ background: '#1a1a1a', color: '#89d185', border: '1px solid #2d4a2d' }}>
                          {issue.fixCode}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {result.issues.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm text-gray-400">No issues found!</div>
              <div className="text-xs text-gray-600 mt-1">Your code looks clean.</div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Shield size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Review your code for bugs,</div>
            <div className="text-xs text-gray-600">security issues & performance</div>
            <div className="text-xs text-gray-700 mt-1">⌃⇧R to start</div>
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
