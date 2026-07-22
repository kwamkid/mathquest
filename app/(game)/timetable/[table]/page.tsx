// app/(game)/timetable/[table]/page.tsx
//
// Legacy route — the round-picker page was removed (tapping a table card now
// plays the next round immediately). Kept only as a redirect so old
// links/bookmarks land in the right round instead of 404.

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/contexts/AuthContext';
import { TABLE_ORDER } from '@/lib/timetable/config';
import {
  getTimetableProgress,
  isTableUnlocked,
  nextRoundInTable,
} from '@/lib/timetable/progress';

export default function TimetableTableRedirect() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const table = Number(params.table);
    const progress = getTimetableProgress(user);
    const valid = TABLE_ORDER.includes(table as (typeof TABLE_ORDER)[number]);
    if (!valid || !isTableUnlocked(progress, table)) {
      router.replace('/timetable');
      return;
    }
    router.replace(`/timetable/${table}/${nextRoundInTable(progress, table)}`);
  }, [loading, user, params.table, router]);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen" />
    </AuthGuard>
  );
}
