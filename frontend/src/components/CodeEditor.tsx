// src/components/CodeEditor.tsx
import React, { useRef, useCallback, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { useEditorStore } from '../store';
import { getMonacoLang } from '../lib/languages';
import type { ReviewIssue } from '../types';
import type * as Monaco from 'monaco-editor';

interface CodeEditorProps {
  reviewIssues?: ReviewIssue[];
  diffMode?: boolean;
  diffOriginal?: string;
  diffModified?: string;
  diffLanguage?: string;
  onShortcut?: (key: string) => void;
  onCursorChange?: (position: { lineNumber: number; column: number }) => void;
}

export default function CodeEditor({
  reviewIssues = [],
  diffMode = false,
  diffOriginal,
  diffModified,
  diffLanguage,
  onShortcut,
  onCursorChange,
}: CodeEditorProps) {
  const { tabs, activeTabId, updateTabContent, updateTabLanguage } = useEditorStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const monacoLang = activeTab ? getMonacoLang(activeTab.language) : 'plaintext';
  const isEmpty = !activeTab?.content?.trim();

  const handleEditorMount = useCallback((editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = editor;

    // Keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyG, () => onShortcut?.('generate'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR, () => onShortcut?.('review'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE, () => onShortcut?.('explain'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD, () => onShortcut?.('docs'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyT, () => onShortcut?.('tests'));
    onCursorChange?.(editor.getPosition() || { lineNumber: 1, column: 1 });
    editor.onDidChangeCursorPosition((event) => {
      onCursorChange?.({ lineNumber: event.position.lineNumber, column: event.position.column });
    });
  }, [onShortcut, onCursorChange]);

  // Apply review decorations
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Clear old decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    if (reviewIssues.length === 0) return;

    const severityColors: Record<string, string> = {
      error: 'rgba(244, 135, 113, 0.2)',
      warning: 'rgba(204, 167, 0, 0.2)',
      info: 'rgba(117, 190, 255, 0.2)',
      suggestion: 'rgba(137, 209, 133, 0.2)',
    };

    const decorations: Monaco.editor.IModelDeltaDecoration[] = reviewIssues.map((issue) => ({
      range: {
        startLineNumber: issue.line,
        startColumn: 1,
        endLineNumber: issue.endLine || issue.line,
        endColumn: 9999,
      },
      options: {
        isWholeLine: true,
        className: `review-decoration-${issue.severity}`,
        glyphMarginClassName: `glyph-${issue.severity}`,
        hoverMessage: { value: `**${issue.severity.toUpperCase()}**: ${issue.description}\n\n${issue.suggestion}` },
        overviewRuler: {
          color: severityColors[issue.severity] || 'transparent',
          position: 1,
        },
        minimap: {
          color: severityColors[issue.severity] || 'transparent',
          position: 1,
        },
      },
    }));

    decorationsRef.current = editor.deltaDecorations([], decorations);
  }, [reviewIssues]);

  if (diffMode && diffOriginal !== undefined && diffModified !== undefined) {
    return (
      <DiffEditor
        original={diffOriginal}
        modified={diffModified}
        language={diffLanguage || 'plaintext'}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          renderSideBySide: true,
          scrollBeyondLastLine: false,
        }}
      />
    );
  }

  return (
    <div className="relative h-full">
      {isEmpty && (
        <div
          className="pointer-events-none absolute left-16 top-3 z-10 text-sm"
          style={{ color: '#6b7280' }}
        >
          Write your code here...
        </div>
      )}
      <Editor
        value={activeTab?.content || ''}
        language={monacoLang}
        theme="vs-dark"
        onChange={(val) => {
          if (activeTabId && val !== undefined) {
            updateTabContent(activeTabId, val);
          }
        }}
        onMount={handleEditorMount}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          tabSize: 2,
          renderWhitespace: 'selection',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}

// Also export a code viewer (read-only)
export function CodeViewer({ code, language }: { code: string; language: string }) {
  return (
    <Editor
      value={code}
      language={language}
      theme="vs-dark"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 8, bottom: 8 },
        folding: false,
        glyphMargin: false,
      }}
    />
  );
}
