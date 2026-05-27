import React, { useEffect, useState } from 'react';
import { X, History, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { HistoryItem } from '../types';

interface Props {
  onClose: () => void;
}

const ACTION_COLORS: Record<string, string> = {
  generate: '#007acc',
  review: '#f48771',
  explain: '#89d185',
  document: '#cca700',
  tests: '#c586c0',
  translate: '#75beff',
  refactor: '#9cdcfe',
};

export default function HistoryModal({ onClose }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.history()
      .then(({ history }) => setItems(history))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-lg shadow-2xl flex flex-col" style={{ background: '#252526', border: '1px solid #3c3c3c', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #3c3c3c' }}>
          <div className="flex items-center gap-2">
            <History size={16} style={{ color: '#007acc' }} />
            <span className="text-sm font-medium text-white">Activity History</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <History size={32} className="mx-auto mb-3" style={{ color: '#3c3c3c' }} />
              <div className="text-sm text-gray-500">No history yet</div>
              <div className="text-xs text-gray-600 mt-1">Start using AI features to see activity here</div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#2d2d2d' }}>
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-800 transition-colors">
                  <div
                    className="px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5"
                    style={{ background: `${ACTION_COLORS[item.action_type]}20`, color: ACTION_COLORS[item.action_type] || '#999' }}
                  >
                    {item.action_type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300 truncate">{item.prompt || '(no prompt)'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 font-mono">{item.language}</span>
                      <Clock size={10} className="text-gray-600" />
                      <span className="text-xs text-gray-600">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
