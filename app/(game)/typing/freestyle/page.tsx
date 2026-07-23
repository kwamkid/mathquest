// app/(game)/typing/freestyle/page.tsx
//
// Freestyle — the post-day-100 WPM arena: random sentences on the Racer skin,
// live WPM readout, personal best in the user doc. Locked until the whole
// 100-day plan is finished (direct URLs bounce to a friendly locked card).

'use client';

import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import TypingRoundPlayer from '@/components/typing/TypingRoundPlayer';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TOTAL_DAYS } from '@/lib/typing/days';
import { getTypingDayState } from '@/lib/typing/progress';

export default function TypingFreestylePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentDay } = getTypingDayState(user);
  const unlocked = currentDay > TOTAL_DAYS;

  return (
    <AuthGuard>
      {unlocked ? (
        <TypingRoundPlayer freestyle />
      ) : (
        <div className="learn-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🔒
          </p>
          <p className="text-xl font-bold text-white">
            {t.typing.freestyleTitle}
          </p>
          <p className="text-base text-white/70">{t.typing.freestyleLocked}</p>
          <button
            onClick={() => router.push('/typing')}
            className="learn-accent-pill mt-2 rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
          >
            {t.typing.backToTyping}
          </button>
        </div>
      )}
    </AuthGuard>
  );
}
