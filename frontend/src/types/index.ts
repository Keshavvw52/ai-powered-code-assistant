// src/types/index.ts

export type Language = 'python' | 'javascript' | 'typescript' | 'go' | 'java' | 'rust' | 'cpp';
export type Complexity = 'snippet' | 'function' | 'module' | 'boilerplate';
export type ExplainDepth = 'beginner' | 'intermediate' | 'expert';
export type IssueSeverity = 'error' | 'warning' | 'info' | 'suggestion';
export type IssueCategory = 'bug' | 'security' | 'performance' | 'style';
export type AIPanel = 'generate' | 'review' | 'explain' | 'docs' | 'tests' | 'translate' | 'refactor';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface EditorTab {
  id: string;
  title: string;
  language: Language;
  content: string;
  isDirty: boolean;
}

export interface ReviewIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  line: number;
  endLine?: number;
  description: string;
  suggestion: string;
  fixCode?: string;
}

export interface ReviewResult {
  grade: string;
  score: number;
  summary: string;
  issues: ReviewIssue[];
  stats: { bugs: number; security: number; performance: number; style: number };
}

export interface ExplainResult {
  overview: string;
  explanation: string;
  lineAnnotations: Array<{ line: number; endLine?: number; note: string }>;
  parameters: Array<{ name: string; type: string; description: string }>;
  returns: string;
  complexity: { time: string; space: string; notes: string };
  algorithm: string | null;
  exampleUsage: string;
}

export interface RefactorSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  beforeCode: string;
  afterCode: string;
}

export interface RefactorResult {
  summary: string;
  metrics: {
    before: { complexity: number; lines: number; nestingDepth: number };
    after: { complexity: number; lines: number; nestingDepth: number };
  };
  suggestions: RefactorSuggestion[];
}

export interface Snippet {
  id: number;
  title: string;
  language: Language;
  code: string;
  tags: string[];
  created_at: string;
}

export interface HistoryItem {
  id: number;
  action_type: string;
  language: string;
  prompt: string;
  created_at: string;
}