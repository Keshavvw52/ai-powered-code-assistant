import React, { useMemo, useState } from 'react';
import { Copy, MessageSquareText, ShieldAlert, Sparkles, TestTube2 } from 'lucide-react';
import type { ReviewResult } from '../types';

type BottomTab = 'review' | 'console' | 'tests' | 'diff';

interface BottomPanelProps {
  reviewResult: ReviewResult | null;
  lastAction: string;
  activeCode: string;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

const TABS: Array<{ id: BottomTab; label: string }> = [
  { id: 'review', label: 'Review' },
  { id: 'console', label: 'Console' },
  { id: 'tests', label: 'Tests' },
  { id: 'diff', label: 'Diff' },
];

const SEVERITY_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  error: { bg: 'rgba(239, 68, 68, 0.14)', color: '#fca5a5', border: '#7f1d1d' },
  warning: { bg: 'rgba(234, 179, 8, 0.14)', color: '#fcd34d', border: '#713f12' },
  info: { bg: 'rgba(59, 130, 246, 0.14)', color: '#93c5fd', border: '#1e3a8a' },
  suggestion: { bg: 'rgba(16, 185, 129, 0.14)', color: '#86efac', border: '#166534' },
};

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border px-4 py-3" style={{ background: '#141b2d', borderColor: '#28314d' }}>
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default function BottomPanel({ reviewResult, lastAction, activeCode, activeTab, onTabChange }: BottomPanelProps) {
  const [expandedFixId, setExpandedFixId] = useState<string | null>(null);

  const reviewStats = useMemo(() => {
    if (!reviewResult) return null;
    return [
      { label: 'Grade', value: reviewResult.grade },
      { label: 'Score', value: `${reviewResult.score}/100` },
      { label: 'Issues', value: reviewResult.issues.length },
      { label: 'Bugs', value: reviewResult.stats.bugs },
      { label: 'Security', value: reviewResult.stats.security },
      { label: 'Performance', value: reviewResult.stats.performance },
      { label: 'Style', value: reviewResult.stats.style },
    ];
  }, [reviewResult]);

  return (
    <div className="mt-4 min-h-[290px] rounded-2xl border flex flex-col overflow-hidden" style={{ background: '#101727', borderColor: '#262b42' }}>
      <div className="h-12 shrink-0 border-b px-4 flex items-center gap-5" style={{ borderColor: '#262b42' }}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="h-full text-sm relative"
              style={{ color: active ? '#f5f3ff' : '#8c93b3' }}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute left-0 right-0 bottom-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        {activeTab === 'review' && reviewResult && reviewStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-3">
              {reviewStats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#262b42' }}>
              <div
                className="grid grid-cols-[140px_80px_1fr_220px] gap-4 px-4 py-3 text-xs uppercase tracking-[0.12em] text-slate-500"
                style={{ background: '#141b2d' }}
              >
                <div>Severity</div>
                <div>Line</div>
                <div>Issue</div>
                <div>Suggestion</div>
              </div>
              {reviewResult.issues.map((issue) => {
                const severity = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.info;
                const isExpanded = expandedFixId === issue.id;

                return (
                  <div key={issue.id} className="border-t px-4 py-4" style={{ borderColor: '#1e2640' }}>
                    <div className="grid grid-cols-[140px_80px_1fr_220px] gap-4 items-start">
                      <div>
                        <span
                          className="inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize"
                          style={{ background: severity.bg, color: severity.color, borderColor: severity.border }}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300">L{issue.line}</div>
                      <div>
                        <div className="text-sm font-medium text-white">{issue.category}</div>
                        <div className="mt-1 text-sm text-slate-400">{issue.description}</div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-slate-300">{issue.suggestion}</div>
                        {issue.fixCode && (
                          <button
                            onClick={() => setExpandedFixId(isExpanded ? null : issue.id)}
                            className="rounded-xl border px-3 py-2 text-sm text-slate-100"
                            style={{ background: '#141b2d', borderColor: '#344064' }}
                          >
                            View Fix
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && issue.fixCode && (
                      <pre className="mt-4 rounded-2xl border p-4 text-xs overflow-auto text-violet-100 font-mono" style={{ background: '#0d1324', borderColor: '#2d3560' }}>
                        {issue.fixCode}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'review' && !reviewResult && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <ShieldAlert size={26} className="mx-auto mb-3 text-violet-300" />
              <div className="text-sm">Run a review from the AI tools to populate this panel.</div>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="h-full rounded-2xl border p-4 font-mono text-sm text-slate-300" style={{ background: '#0d1324', borderColor: '#262b42' }}>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <MessageSquareText size={16} />
              <span>Console activity</span>
            </div>
            <div>{lastAction || 'No console output yet. Run AI actions to see activity here.'}</div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="h-full rounded-2xl border p-4 text-slate-300" style={{ background: '#0d1324', borderColor: '#262b42' }}>
            <div className="flex items-center gap-2 text-slate-200 mb-3">
              <TestTube2 size={16} className="text-violet-300" />
              <span className="font-medium">Tests Panel</span>
            </div>
            <div className="text-sm text-slate-400">Generated unit tests and future execution logs can be reviewed here.</div>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="h-full rounded-2xl border p-4" style={{ background: '#0d1324', borderColor: '#262b42' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-200">
                <Sparkles size={16} className="text-violet-300" />
                <span className="font-medium">Current Editor Snapshot</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(activeCode)}
                className="rounded-xl border px-3 py-2 text-sm text-slate-100 flex items-center gap-2"
                style={{ background: '#141b2d', borderColor: '#344064' }}
              >
                <Copy size={14} />
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">{activeCode || '// No code in editor yet'}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
