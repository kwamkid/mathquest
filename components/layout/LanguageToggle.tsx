// components/layout/LanguageToggle.tsx
//
// Compact TH | EN segmented switch, lives in the AppHeader right cluster
// (and standalone on pages without the header, e.g. the landing hero).
// Big enough to tap (44px hit area via padding) but visually small.

'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/strings';

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'th', label: 'ไทย' },
  { value: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="glass-dark flex shrink-0 items-center rounded-full border border-metaverse-purple/30 p-0.5"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition sm:px-3 ${
            lang === opt.value
              ? 'learn-accent-pill shadow-md shadow-pink-500/30'
              : 'text-white/55 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
