// src/pages/Dashboard.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '../store';
import type { Complexity, Language, ReviewIssue, ReviewResult } from '../types';
import { api, streamRequest } from '../lib/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import TabBar from '../components/TabBar';
import CodeEditor from '../components/CodeEditor';
import BottomPanel from '../components/BottomPanel';
import RightPanel from '../components/RightPanel';
import StatusBar from '../components/StatusBar';
import HistoryModal from '../components/HistoryModal';
import { getLangMeta } from '../lib/languages';

type BottomTab = 'review' | 'console' | 'tests' | 'diff';

interface DashboardProps {
  onGoHome: () => void;
}

export default function Dashboard({ onGoHome }: DashboardProps) {
  const { setActivePanel, getActiveTab, activeTabId, updateTabLanguage, addTab } = useEditorStore();
  const [reviewIssues, setReviewIssues] = useState<ReviewIssue[]>([]);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [lastAction, setLastAction] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 });
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>('review');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generateLanguage, setGenerateLanguage] = useState<Language>('python');
  const [generateComplexity, setGenerateComplexity] = useState<Complexity>('function');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null);
  const [generationFinishedAt, setGenerationFinishedAt] = useState<number | null>(null);
  const cancelGenerateRef = useRef<(() => void) | null>(null);
  const activeTab = getActiveTab();

  useEffect(() => {
    if (activeTab?.language) {
      setGenerateLanguage(activeTab.language);
    }
  }, [activeTab?.language]);

  const generationDurationLabel = useMemo(() => {
    if (!generationStartedAt) return null;
    const end = generationFinishedAt ?? Date.now();
    return `${((end - generationStartedAt) / 1000).toFixed(1)}s`;
  }, [generationFinishedAt, generationStartedAt]);

  const handleShortcut = useCallback((key: string) => {
    setActivePanel(key as any);
    setLastAction(`${key} triggered`);

    // Auto-run for review when shortcut used
    if (key === 'review') {
      const tab = getActiveTab();
      if (tab?.content.trim()) {
        setLastAction('Running review...');
        api.review({ language: tab.language, code: tab.content })
          .then((data) => {
            setReviewIssues(data.issues);
            setReviewResult(data);
            setLastAction(`Review: ${data.issues.length} issues found`);
          })
          .catch((err) => toast.error(err.message));
      }
    }
  }, [setActivePanel, getActiveTab]);

  const runReviewForCurrentCode = useCallback(() => {
    const tab = getActiveTab();
    if (!tab?.content.trim()) {
      toast.error('Editor is empty');
      return;
    }

    setBottomTab('review');
    setActivePanel('review');
    setLastAction('Running AI review for current code...');

    api.review({ language: tab.language, code: tab.content })
      .then((data) => {
        setReviewIssues(data.issues);
        setReviewResult(data);
        setLastAction(`Review: ${data.issues.length} issues found`);
        toast.success('Review generated for current code');
      })
      .catch((err) => toast.error(err.message));
  }, [getActiveTab, setActivePanel]);

  const handleGenerate = useCallback(() => {
    if (isGenerating) {
      cancelGenerateRef.current?.();
      setIsGenerating(false);
      setGenerationFinishedAt(Date.now());
      setLastAction('Generation cancelled');
      return;
    }

    const tab = getActiveTab();

    if (!generatePrompt.trim()) {
      toast.error('Enter a description');
      return;
    }

    setActivePanel('generate');
    setGeneratedCode('');
    setIsGenerating(true);
    setGenerationStarted(true);
    setGenerationStartedAt(Date.now());
    setGenerationFinishedAt(null);
    setLastAction(`Generating ${generateLanguage} ${generateComplexity}...`);

    const existingCode =
      tab?.language === generateLanguage && tab.content.trim()
        ? tab.content
        : undefined;

    cancelGenerateRef.current = streamRequest(
      '/generate',
      { language: generateLanguage, prompt: generatePrompt, complexity: generateComplexity, existingCode },
      (token) => setGeneratedCode((previous) => previous + token),
      () => {
        setIsGenerating(false);
        setGenerationFinishedAt(Date.now());
        setLastAction('Generation completed');
      },
      (err) => {
        setIsGenerating(false);
        setGenerationFinishedAt(Date.now());
        toast.error(err);
      }
    );
  }, [generateComplexity, generateLanguage, generatePrompt, getActiveTab, isGenerating, setActivePanel]);

  const handleInsertGeneratedCode = useCallback(() => {
    if (!generatedCode) return;
    const meta = getLangMeta(generateLanguage);
    addTab(generateLanguage, generatedCode, `generated.${meta.ext}`);
    setLastAction('Opened generated code in a new editor tab');
    toast.success('Opened in new tab');
  }, [addTab, generateLanguage, generatedCode]);

  const handleDownloadGeneratedCode = useCallback(() => {
    if (!generatedCode) return;
    const meta = getLangMeta(generateLanguage);
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `generated.${meta.ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded generated code');
  }, [generateLanguage, generatedCode]);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#0b1020' }}>
      <Sidebar onShowHistory={() => setShowHistory(true)} onGoHome={onGoHome} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
        />

        <div className="flex-1 min-h-0 p-4">
          <div className={`h-full flex flex-col ${isEditorExpanded ? 'fixed inset-4 z-40 p-4 rounded-3xl border shadow-2xl' : ''}`} style={isEditorExpanded ? { background: '#0b1020', borderColor: '#262b42' } : undefined}>
            <div className="rounded-2xl border flex flex-col flex-1 min-h-0 overflow-hidden" style={{ background: '#111626', borderColor: '#262b42' }}>
              <TabBar
                onToggleFullscreen={() => setIsEditorExpanded((value) => !value)}
                onRun={runReviewForCurrentCode}
              />
              <div className="flex-1 min-h-0 px-4 pt-4">
                <CodeEditor
                  reviewIssues={reviewIssues}
                  onShortcut={handleShortcut}
                  onCursorChange={setCursor}
                />
              </div>
              <StatusBar cursor={cursor} />
            </div>

            {!isEditorExpanded && (
              <BottomPanel
                reviewResult={reviewResult}
                lastAction={lastAction}
                activeCode={activeTab?.content || ''}
                activeTab={bottomTab}
                onTabChange={setBottomTab}
              />
            )}
          </div>
        </div>
      </div>

      {!isEditorExpanded && (
        <RightPanel
          generatedCode={generatedCode}
          generateLanguage={generateLanguage}
          generateComplexity={generateComplexity}
          generatePrompt={generatePrompt}
          isGenerating={isGenerating}
          generationDurationLabel={generationDurationLabel}
          generationStarted={generationStarted}
          onGenerateLanguageChange={(language) => {
            setGenerateLanguage(language);
            if (activeTabId) updateTabLanguage(activeTabId, language);
          }}
          onGenerateComplexityChange={setGenerateComplexity}
          onGeneratePromptChange={setGeneratePrompt}
          onGenerate={handleGenerate}
          onInsertGeneratedCode={handleInsertGeneratedCode}
          onDownloadGeneratedCode={handleDownloadGeneratedCode}
          onCopyGeneratedCode={() => {
            navigator.clipboard.writeText(generatedCode);
            toast.success('Copied generated code');
          }}
          onIssuesChange={(issues) => {
            setReviewIssues(issues);
            setLastAction(`Review: ${issues.length} issues found`);
          }}
          onReviewResultChange={(result) => {
            setReviewResult(result);
            if (result) setLastAction(`Review: ${result.issues.length} issues found`);
          }}
        />
      )}

      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}
