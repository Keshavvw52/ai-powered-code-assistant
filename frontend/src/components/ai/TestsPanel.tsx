// src/components/panels/TestsPanel.tsx
import React, { useState, useRef } from 'react';
import { TestTube, Copy, Plus, Loader2 } from 'lucide-react';
import { useEditorStore } from '../../store';
import { streamRequest } from '../../lib/api';
import { getLangMeta } from '../../lib/languages';
import StreamOutput from '../StreamOutput';
import toast from 'react-hot-toast';

const FRAMEWORK_MAP: Record<string, string> = {
  python: 'pytest', javascript: 'Jest', typescript: 'Vitest',
  go: 'testing', java: 'JUnit 5', rust: 'cargo test', cpp: 'Google Test',
};

export default function TestsPanel() {
  const { getActiveTab, addTab } = useEditorStore();
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const tab = getActiveTab();
  const framework = tab ? FRAMEWORK_MAP[tab.language] : '';

  const generate = () => {
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    setOutput('');
    setIsStreaming(true);
    cancelRef.current = streamRequest(
      '/tests',
      { language: tab.language, code: tab.content },
      (t) => setOutput((p) => p + t),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); toast.error(e); }
    );
  };

  const openInTab = () => {
    if (!tab || !output) return;
    const meta = getLangMeta(tab.language);
    addTab(tab.language, output, `test.${meta.ext}`);
    toast.success('Opened in new tab');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        {framework && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            Using <span className="px-1.5 rounded font-mono" style={{ background: '#2d2d2d', color: '#9cdcfe' }}>{framework}</span>
          </div>
        )}
        <button
          onClick={generate}
          disabled={isStreaming}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <TestTube size={13} />}
          {isStreaming ? 'Generating tests...' : 'Generate Unit Tests'}
        </button>
      </div>

      {output ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <span className="text-xs text-gray-400">Generated Tests</span>
            <div className="flex gap-1">
              <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Copy size={12} /></button>
              <button onClick={openInTab} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Plus size={12} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <StreamOutput content={output} isStreaming={isStreaming} />
          </div>
          {!isStreaming && (
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid #3c3c3c' }}>
              <button onClick={openInTab} className="w-full py-1.5 rounded text-xs font-medium text-white" style={{ background: '#007acc' }}>
                Open in New Tab
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <TestTube size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Generate comprehensive tests</div>
            <div className="text-xs text-gray-600">with edge cases and mocks</div>
            <div className="text-xs text-gray-700 mt-1">⌃⇧T to start</div>
          </div>
        </div>
      )}
    </div>
  );
}