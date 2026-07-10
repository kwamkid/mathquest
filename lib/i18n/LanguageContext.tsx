// lib/i18n/LanguageContext.tsx
//
// App-wide language state (th | en) with localStorage persistence.
//
// Design intent (from the parent): this is NOT a plain translation switch —
// it's a bilingual LEARNING tool. Thai mode deliberately keeps key English
// math vocabulary inline (e.g. "เศษส่วน Fractions", stage names, mode names)
// so the kid absorbs English terms while reading Thai. English mode is full
// English. See lib/i18n/strings.ts for the dictionary + conventions.

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { STRINGS, type Lang, type Strings } from './strings';

const STORAGE_KEY = 'mathquest-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  // The active dictionary — components read t.someSection.someKey.
  t: Strings;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'th',
  setLang: () => undefined, // no-op default; real setter comes from the provider
  t: STRINGS.th,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default 'th' (matches SSR) — read the stored choice after mount so the
  // server and first client render agree (avoids hydration mismatch).
  const [lang, setLangState] = useState<Lang>('th');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'th') setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Pick the right title off curriculum data that carries both `title` (EN) and
// `thaiTitle`. Thai mode prefers thaiTitle (authored bilingual on purpose);
// EN mode prefers the English title.
export const localizeTitle = (
  lang: Lang,
  item: { title: string; thaiTitle?: string },
): string =>
  lang === 'en' ? item.title : (item.thaiTitle ?? item.title);
