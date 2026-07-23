// app/(game)/typing/day/[n]/page.tsx
//
// Plays one day of the 100-day plan (แผน 100 วัน). The round player resolves
// the day into content + save path via lib/typing/days.ts.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import TypingRoundPlayer from '@/components/typing/TypingRoundPlayer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TOTAL_DAYS } from '@/lib/typing/days';

export default function TypingDayPage() {
  const { t } = useLanguage();
  const params = useParams();
  const day = Number(params.n);

  const valid = Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS;

  if (!valid) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">
            {t.typing.stageNotFound}
          </p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {/* key forces fresh content per day. */}
      <TypingRoundPlayer key={`day-${day}`} day={day} />
    </AuthGuard>
  );
}
