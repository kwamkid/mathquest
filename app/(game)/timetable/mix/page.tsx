// app/(game)/timetable/mix/page.tsx
//
// ด่านรวมพลัง (Mix Challenge) — one drill round drawing from EVERY table the
// learner has unlocked. Replayable without limit; EXP pays once per day (see
// lib/timetable/progress.ts saveMixChallenge). Needs ≥2 unlocked tables to be
// worth mixing — below that we bounce back to the landing.

'use client';

import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import TimetableRoundPlayer from '@/components/timetable/TimetableRoundPlayer';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  getTimetableProgress,
  unlockedTables,
} from '@/lib/timetable/progress';

export default function TimetableMixPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const progress = getTimetableProgress(user);
  const tables = unlockedTables(progress);

  if (tables.length < 2) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold text-white">{t.timetable.mixNeed2}</p>
          <Link
            href="/timetable"
            className="learn-accent-pill rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30"
          >
            {t.timetable.backToTimetable}
          </Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <TimetableRoundPlayer
        key={tables.join('-')}
        variant={{ kind: 'mix', tables }}
      />
    </AuthGuard>
  );
}
