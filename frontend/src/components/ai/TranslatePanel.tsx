// src/components/panels/TranslatePanel.tsx
import React, { useState, useRef } from 'react';
import { ArrowLeftRight, Copy, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store';
import { streamRequest } from '../../lib/api';
import type { Language } from '../../types';
import { LANGUAGES } from '../../lib/languages';
import StreamOutput from '../StreamOutput';
import toast from 'react-hot-toast';

export default function TranslatePanel() {
  const { getActiveTab, addTab } = useEditorStore();
  const tab = getActiveTab();
  const [targetLang, setTargetLang] = useState<Language>('javascript');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const translate = () => {
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    if (tab.language === targetLang) return toast.error('Source and target languages must differ');
    setOutput('');
    setIsStreaming(true);
    cancelRef.current = streamRequest(
      '/translate',
      { sourceLanguage: tab.language, targetLanguage: targetLang, code: tab.content },
      (t) => setOutput((p) => p + t),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); toast.error(e); }
    );
  };

  const openInTab = () => {
    if (!output) return;
    addTab(targetLang, output);
    toast.success('Opened in new tab');
  };

  const availableTargets = LANGUAGES.filter((l) => l.id !== tab?.language);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        {/* Source → Target */}
        <div className="flex items-center gap-2">
          <div className="flex-1 px-2 py-1.5 rounded text-xs text-gray-400" style={{ background: '#2d2d2d', border: '1px solid #3c3c3c' }}>
            {LANGUAGES.find((l) => l.id === tab?.language)?.label || 'Auto'}
          </div>
          <ArrowLeftRight size={14} className="text-gray-500 shrink-0" />
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as Language)}
            className="flex-1 px-2 py-1.5 rounded text-xs"
            style={{ background: '#2d2d2d', border: '1px solid #3c3c3c', color: '#ccc' }}
          >
            {availableTargets.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={translate}
          disabled={isStreaming}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <ArrowLeftRight size={13} />}
          {isStreaming ? 'Translating...' : 'Translate Code'}
        </button>
      </div>

      {output ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <span className="text-xs text-gray-400">
              Translated to {LANGUAGES.find((l) => l.id === targetLang)?.label}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }}
              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <StreamOutput content={output} isStreaming={isStreaming} language={targetLang} />
          </div>
          {!isStreaming && (
            <div className="p-3 flex gap-2 shrink-0" style={{ borderTop: '1px solid #3c3c3c' }}>
              <button
                onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }}
                className="flex-1 py-1.5 rounded text-xs font-medium"
                style={{ background: '#2d2d2d', color: '#ccc', border: '1px solid #3c3c3c' }}
              >
                Copy Translated
              </button>
              <button
                onClick={openInTab}
                className="flex-1 py-1.5 rounded text-xs font-medium text-white"
                style={{ background: '#007acc' }}
              >
                Open in New Tab
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ArrowLeftRight size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Translate between 7 languages</div>
            <div className="text-xs text-gray-600">with idiomatic output</div>
          </div>
        </div>
      )}
    </div>
  );
}
