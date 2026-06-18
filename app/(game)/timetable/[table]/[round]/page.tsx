// app/(game)/timetable/[table]/[round]/page.tsx
//
// Plays a single timetable round. Generates questions at runtime; the player
// component handles the quiz flow + EXP award.

'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import TimetableRoundPlayer from '@/components/timetable/TimetableRoundPlayer';
import { ROUNDS_PER_TABLE, TABLE_ORDER } from '@/lib/timetable/config';

export default function TimetableRoundPage() {
  const params = useParams();
  const table = Number(params.table);
  const round = Number(params.round);

  const valid =
    TABLE_ORDER.includes(table as (typeof TABLE_ORDER)[number]) &&
    Number.isInteger(round) &&
    round >= 1 &&
    round <= ROUNDS_PER_TABLE;

  if (!valid) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen items-center justify-center p-6">
          <p className="text-lg font-semibold text-white">ไม่พบรอบฝึกนี้</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {/* key forces a fresh generation on each table/round. */}
      <TimetableRoundPlayer key={`${table}-${round}`} table={table} round={round} />
    </AuthGuard>
  );
}
