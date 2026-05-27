// src/components/panels/DocsPanel.tsx
import React, { useState, useRef } from 'react';
import { FileText, Copy, Loader2, RefreshCw } from 'lucide-react';
import { useEditorStore } from '../../store';
import { streamRequest } from '../../lib/api';
import StreamOutput from '../StreamOutput';
import toast from 'react-hot-toast';

export default function DocsPanel() {
  const { getActiveTab, updateTabContent, activeTabId } = useEditorStore();
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const generate = () => {
    const tab = getActiveTab();
    if (!tab?.content.trim()) return toast.error('Editor is empty');
    setOutput('');
    setIsStreaming(true);
    cancelRef.current = streamRequest(
      '/document',
      { language: tab.language, code: tab.content },
      (t) => setOutput((p) => p + t),
      () => setIsStreaming(false),
      (e) => { setIsStreaming(false); toast.error(e); }
    );
  };

  const insertAbove = () => {
    const tab = getActiveTab();
    if (!tab || !output) return;
    updateTabContent(activeTabId, output + '\n' + tab.content);
    toast.success('Documentation inserted above');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        <button
          onClick={generate}
          disabled={isStreaming}
          className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium text-white disabled:opacity-50"
          style={{ background: '#007acc' }}
        >
          {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
          {isStreaming ? 'Generating docs...' : 'Generate Documentation'}
        </button>
      </div>

      {output ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <span className="text-xs text-gray-400">Documentation</span>
            <div className="flex gap-1">
              <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied'); }} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Copy size={12} /></button>
              <button onClick={insertAbove} title="Insert above function" className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><RefreshCw size={12} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <StreamOutput content={output} isStreaming={isStreaming} />
          </div>
          {!isStreaming && (
            <div className="p-3 shrink-0" style={{ borderTop: '1px solid #3c3c3c' }}>
              <button onClick={insertAbove} className="w-full py-1.5 rounded text-xs font-medium text-white" style={{ background: '#007acc' }}>
                Insert Above Function
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <FileText size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Generate JSDoc, docstrings,</div>
            <div className="text-xs text-gray-600">GoDoc, and Javadoc</div>
            <div className="text-xs text-gray-700 mt-1">⌃⇧D to start</div>
          </div>
        </div>
      )}
    </div>
  );
}