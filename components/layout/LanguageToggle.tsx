// components/layout/LanguageToggle.tsx
//
// Language switch for the top bar. Mobile: ONE compact pill showing the
// current language — tap to flip (header space is tight). sm+: the full
// ไทย | EN segmented control.

'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/strings';

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'th', label: 'ไทย' },
  { value: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const other: Lang = lang === 'th' ? 'en' : 'th';

  return (
    <>
      {/* Mobile: single flip button (shows current, tap = switch). */}
      <button
        onClick={() => setLang(other)}
        aria-label={`Language: ${lang} — switch`}
        className="glass flex h-9 min-w-11 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold text-white/85 transition hover:bg-white/10 sm:hidden"
      >
        {OPTIONS.find((o) => o.value === lang)?.label}
      </button>

      {/* sm+: segmented control. */}
      <div
        role="group"
        aria-label="Language"
        className="glass-dark hidden shrink-0 items-center rounded-full border border-metaverse-purple/30 p-0.5 sm:flex"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value)}
            aria-pressed={lang === opt.value}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              lang === opt.value
                ? 'learn-accent-pill shadow-md shadow-pink-500/30'
                : 'text-white/55 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}
