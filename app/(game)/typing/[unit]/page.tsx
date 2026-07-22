// app/(game)/typing/[unit]/page.tsx
//
// Legacy route — the stage-picker page was removed (tapping a unit card now
// plays immediately; the finger lesson lives on the round intro). Kept only
// as a redirect so old links/bookmarks land in the right stage instead of 404.

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/contexts/AuthContext';
import { unitDef } from '@/lib/typing/config';
import {
  getTypingProgress,
  isUnitUnlocked,
  nextStageInUnit,
} from '@/lib/typing/progress';

export default function TypingUnitRedirect() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const unit = Number(params.unit);
    const progress = getTypingProgress(user);
    if (!unitDef(unit) || !isUnitUnlocked(progress, unit)) {
      router.replace('/typing');
      return;
    }
    router.replace(`/typing/${unit}/${nextStageInUnit(progress, unit)}`);
  }, [loading, user, params.unit, router]);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen" />
    </AuthGuard>
  );
}
