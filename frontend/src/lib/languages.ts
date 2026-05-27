import type { Language } from '../types';

type LanguageMeta = {
  id: Language;
  label: string;
  ext: string;
  monaco: string;
  color: string;
};

export const LANGUAGES: LanguageMeta[] = [
  { id: 'python', label: 'Python', ext: 'py', monaco: 'python', color: '#3572A5' },
  { id: 'javascript', label: 'JavaScript', ext: 'js', monaco: 'javascript', color: '#f7df1e' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts', monaco: 'typescript', color: '#3178c6' },
  { id: 'go', label: 'Go', ext: 'go', monaco: 'go', color: '#00ADD8' },
  { id: 'java', label: 'Java', ext: 'java', monaco: 'java', color: '#b07219' },
  { id: 'rust', label: 'Rust', ext: 'rs', monaco: 'rust', color: '#dea584' },
  { id: 'cpp', label: 'C++', ext: 'cpp', monaco: 'cpp', color: '#f34b7d' },
];

const FALLBACK_LANGUAGE = LANGUAGES[0];

export function getLangMeta(language: Language): LanguageMeta {
  return LANGUAGES.find((entry) => entry.id === language) ?? FALLBACK_LANGUAGE;
}

export function getMonacoLang(language: Language): string {
  return getLangMeta(language).monaco;
}
