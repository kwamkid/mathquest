// app/(game)/typing/[unit]/[stage]/page.tsx
//
// Plays one typing stage (the Space Typing Defense round). Content is
// generated at runtime; the player handles the game flow + EXP award.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import TypingRoundPlayer from '@/components/typing/TypingRoundPlayer';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { STAGES_PER_UNIT, UNITS } from '@/lib/typing/config';

export default function TypingStagePage() {
  const { t } = useLanguage();
  const params = useParams();
  const unit = Number(params.unit);
  const stage = Number(params.stage);

  const valid =
    UNITS.some((u) => u.number === unit) &&
    Number.isInteger(stage) &&
    stage >= 1 &&
    stage <= STAGES_PER_UNIT;

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
      {/* key forces fresh content per unit/stage. */}
      <TypingRoundPlayer key={`${unit}-${stage}`} unit={unit} stage={stage} />
    </AuthGuard>
  );
}
