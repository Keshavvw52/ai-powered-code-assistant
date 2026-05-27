// src/components/panels/GeneratePanel.tsx
import React, { useState, useRef } from 'react';
import { Zap, Copy, Plus, RefreshCw, X } from 'lucide-react';
import { useEditorStore } from '../../store';
import { streamRequest } from '../../lib/api';
import type { Complexity, Language } from '../../types';
import { LANGUAGES } from '../../lib/languages';
import StreamOutput from '../StreamOutput';
import toast from 'react-hot-toast';

export default function GeneratePanel() {
  const { getActiveTab, addTab, updateTabContent, activeTabId } = useEditorStore();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [complexity, setComplexity] = useState<Complexity>('function');
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [refineMode, setRefineMode] = useState(false);
  const [refinement, setRefinement] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);

  const activeTab = getActiveTab();

  const generate = () => {
    if (!prompt.trim()) return toast.error('Enter a description');
    setOutput('');
    setIsStreaming(true);
    setRefineMode(false);
    const existingCode =
      activeTab?.language === language && activeTab.content.trim()
        ? activeTab.content
        : undefined;

    cancelRef.current = streamRequest(
      '/generate',
      { language, prompt, complexity, existingCode },
      (token) => setOutput((p) => p + token),
      () => { setIsStreaming(false); setRefineMode(true); },
      (err) => { setIsStreaming(false); toast.error(err); }
    );
  };

  const refine = () => {
    if (!refinement.trim() || !output) return;
    const prev = output;
    setOutput('');
    setIsStreaming(true);

    cancelRef.current = streamRequest(
      '/generate/refine',
      { language, existingCode: prev, refinement },
      (token) => setOutput((p) => p + token),
      () => { setIsStreaming(false); },
      (err) => { setIsStreaming(false); toast.error(err); }
    );
  };

  const cancel = () => {
    cancelRef.current?.();
    setIsStreaming(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const insertInEditor = () => {
    if (!activeTab || !output) return;
    updateTabContent(activeTabId, activeTab.content + '\n\n' + output);
    toast.success('Inserted into editor');
  };

  const openInNewTab = () => {
    if (!output) return;
    addTab(language, output, `generated.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'ts'}`);
    toast.success('Opened in new tab');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Config */}
      <div className="p-3 space-y-3 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
        <div className="flex gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="flex-1 px-2 py-1.5 rounded text-xs"
            style={{ background: '#2d2d2d', border: '1px solid #3c3c3c', color: '#ccc' }}
          >
            {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value as Complexity)}
            className="flex-1 px-2 py-1.5 rounded text-xs"
            style={{ background: '#2d2d2d', border: '1px solid #3c3c3c', color: '#ccc' }}
          >
            {['snippet', 'function', 'module', 'boilerplate'].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
          placeholder="Describe what you want to generate... (⌘/Ctrl+Enter to run)"
          rows={3}
          className="w-full px-2.5 py-2 rounded text-xs resize-none"
          style={{ background: '#2d2d2d', border: '1px solid #3c3c3c', color: '#ccc', lineHeight: '1.5' }}
        />

        <div className="flex gap-2">
          <button
            onClick={isStreaming ? cancel : generate}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium text-white transition-colors"
            style={{ background: isStreaming ? '#5a1a1a' : '#007acc' }}
          >
            {isStreaming ? <><X size={12} /> Cancel</> : <><Zap size={12} /> Generate</>}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #3c3c3c' }}>
            <span className="text-xs text-gray-400">Generated Code</span>
            <div className="flex gap-1">
              <button onClick={copyOutput} title="Copy" className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                <Copy size={12} />
              </button>
              <button onClick={insertInEditor} title="Insert in editor" className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                <RefreshCw size={12} />
              </button>
              <button onClick={openInNewTab} title="Open in new tab" className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <StreamOutput content={output} isStreaming={isStreaming} language={language} />
          </div>

          {/* Action buttons */}
          {!isStreaming && output && (
            <div className="flex gap-2 p-3 shrink-0" style={{ borderTop: '1px solid #3c3c3c' }}>
              <button onClick={insertInEditor} className="flex-1 py-1.5 rounded text-xs font-medium" style={{ background: '#007acc', color: '#fff' }}>
                Insert at Cursor
              </button>
              <button onClick={openInNewTab} className="flex-1 py-1.5 rounded text-xs font-medium" style={{ background: '#2d2d2d', color: '#ccc', border: '1px solid #3c3c3c' }}>
                New Tab
              </button>
            </div>
          )}
        </div>
      )}

      {/* Refine */}
      {refineMode && output && (
        <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid #3c3c3c' }}>
          <div className="text-xs text-gray-400">Refine the generated code:</div>
          <div className="flex gap-2">
            <input
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') refine(); }}
              placeholder="e.g. 'Add error handling', 'Make it async'..."
              className="flex-1 px-2 py-1.5 rounded text-xs"
              style={{ background: '#2d2d2d', border: '1px solid #3c3c3c', color: '#ccc' }}
            />
            <button onClick={refine} className="px-3 py-1.5 rounded text-xs font-medium text-white" style={{ background: '#007acc' }}>
              Refine
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!output && !isStreaming && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Zap size={24} className="mx-auto mb-2" style={{ color: '#3c3c3c' }} />
            <div className="text-xs text-gray-600">Describe what to generate above</div>
            <div className="text-xs text-gray-700 mt-1">⌃⇧G to focus</div>
          </div>
        </div>
      )}
    </div>
  );
}
