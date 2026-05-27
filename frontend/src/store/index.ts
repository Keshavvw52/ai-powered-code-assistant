// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, EditorTab, Language, AIPanel } from '../types';

// ── Auth Store ──────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);

// ── Editor Store ─────────────────────────────────────────────────────────────
let tabCounter = 1;

function createTab(title: string, language: Language, content = ''): EditorTab {
  return { id: `tab-${tabCounter++}`, title, language, content, isDirty: false };
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string;
  activePanel: AIPanel;
  isSidebarOpen: boolean;

  addTab: (language?: Language, content?: string, title?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  updateTabLanguage: (id: string, language: Language) => void;
  setActivePanel: (panel: AIPanel) => void;
  toggleSidebar: () => void;
  getActiveTab: () => EditorTab | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const initial = createTab('untitled-1.py', 'python');
  return {
    tabs: [initial],
    activeTabId: initial.id,
    activePanel: 'generate',
    isSidebarOpen: true,

    addTab: (language = 'python', content, title) => {
      const lang = language;
      const tab = createTab(
        title || `untitled-${tabCounter}.${langExt(lang)}`,
        lang,
        content ?? ''
      );
      set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
    },

    closeTab: (id) => set((s) => {
      const tabs = s.tabs.filter((t) => t.id !== id);
      if (tabs.length === 0) {
        const newTab = createTab('untitled-1.py', 'python');
        return { tabs: [newTab], activeTabId: newTab.id };
      }
      const activeTabId = s.activeTabId === id ? tabs[tabs.length - 1].id : s.activeTabId;
      return { tabs, activeTabId };
    }),

    setActiveTab: (id) => set({ activeTabId: id }),

    updateTabContent: (id, content) => set((s) => ({
      tabs: s.tabs.map((t) => t.id === id ? { ...t, content, isDirty: true } : t),
    })),

    updateTabLanguage: (id, language) => set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.id !== id) return t;

        const untitledPattern = /^untitled-\d+\.[a-z0-9]+$/i;
        const nextTitle = untitledPattern.test(t.title)
          ? t.title.replace(/\.[a-z0-9]+$/i, `.${langExt(language)}`)
          : t.title;

        return { ...t, language, title: nextTitle };
      }),
    })),

    setActivePanel: (panel) => set({ activePanel: panel }),
    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    getActiveTab: () => get().tabs.find((t) => t.id === get().activeTabId),
  };
});

function langExt(lang: Language): string {
  const map: Record<Language, string> = {
    python: 'py', javascript: 'js', typescript: 'ts',
    go: 'go', java: 'java', rust: 'rs', cpp: 'cpp',
  };
  return map[lang] || 'txt';
}
