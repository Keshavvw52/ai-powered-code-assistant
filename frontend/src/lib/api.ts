// src/lib/api.ts
import type { Language, ExplainDepth, ReviewResult, ExplainResult, RefactorResult } from '../types';

const BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

// Auth
export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      post<{ token: string; user: { id: number; name: string; email: string } }>('/auth/signup', data),
    login: (data: { email: string; password: string }) =>
      post<{ token: string; user: { id: number; name: string; email: string } }>('/auth/login', data),
    me: () => get<{ user: { id: number; name: string; email: string } }>('/auth/me'),
  },

  // AI endpoints
  review: (data: { language: Language; code: string }) =>
    post<ReviewResult>('/review', data),

  explain: (data: { language: Language; code: string; depth: ExplainDepth }) =>
    post<ExplainResult>('/explain', { ...data, stream: false }),

  refactor: (data: { language: Language; code: string }) =>
    post<RefactorResult>('/refactor', data),

  detectLanguage: (code: string) =>
    post<{ language: Language; confidence: number }>('/detect-language', { code }),

  snippets: {
    list: (params?: { search?: string; language?: Language }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return get<{ snippets: any[] }>(`/snippets${q ? '?' + q : ''}`);
    },
    save: (data: { title: string; language: Language; code: string; tags: string[] }) =>
      post<{ snippet: any }>('/snippets', data),
    delete: (id: number) => fetch(`${BASE}/snippets/${id}`, { method: 'DELETE', headers: getHeaders() }),
  },

  history: () => get<{ history: any[] }>('/history'),
};

// SSE streaming helper
export function streamRequest(
  path: string,
  body: unknown,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...body as object, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        onError(err.error || 'Request failed');
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) onToken(data.token);
              if (data.done) onDone();
              if (data.error) onError(data.error);
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') onError(err.message);
    }
  })();

  return () => controller.abort();
}
