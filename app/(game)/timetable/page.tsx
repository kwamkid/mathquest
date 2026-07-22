// app/(game)/timetable/page.tsx
//
// Timetable (สูตรคูณ) landing — the "table map". A grid of table cards (one
// per แม่) each showing its 3 mastery stars, plus the daily mix challenge.
// Progression is star-based: earning a table's FIRST star unlocks the next
// table, so kids sweep forward quickly and come back for ⭐⭐/⭐⭐⭐ whenever
// they like (see lib/timetable/config.ts for the model).

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Play, Shuffle, Star, X } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Strings } from '@/lib/i18n/strings';
import {
  EXP_MIX_DAILY,
  ROUNDS_PER_TABLE,
  STAGES_PER_TABLE,
  stageOfRound,
  TABLE_ORDER,
} from '@/lib/timetable/config';
import {
  findNextRound,
  getTimetableProgress,
  isMixClaimedToday,
  isTableUnlocked,
  nextRoundInTable,
  tableRoundsCleared,
  tableStars,
  unlockedTables,
} from '@/lib/timetable/progress';

export default function TimetableHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const progress = getTimetableProgress(user);

  const next = findNextRound(progress);
  const totalStars = (TABLE_ORDER as readonly number[]).reduce(
    (sum, t) => sum + tableStars(progress, t),
    0,
  );
  const maxStars = TABLE_ORDER.length * STAGES_PER_TABLE;
  const mixTables = unlockedTables(progress);
  const mixReady = mixTables.length >= 2;
  const mixClaimed = isMixClaimedToday(progress);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && <AppHeader user={user} />}
        <div className="px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
          <div className="mx-auto max-w-3xl space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="learn-accent-pill flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-pink-500/30">
                    <X className="h-6 w-6" strokeWidth={3} />
                  </span>
                  <h1 className="text-3xl font-bold text-white">
                    {t.timetable.title}{' '}
                    <span className="text-white/60">{t.timetable.titleTag}</span>
                  </h1>
                </div>
                <p className="mt-2 text-base text-white/70">
                  {t.timetable.subtitle}
                </p>
              </div>
              {/* Total star count — the collect-them-all hook. */}
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-4 py-2">
                <Star className="h-5 w-5 fill-current text-amber-300" />
                <span className="text-base font-bold text-amber-200">
                  {totalStars}/{maxStars}
                </span>
              </div>
            </header>

            {/* Continue CTA — the one thing to tap. */}
            {next && (
              <button
                onClick={() => router.push(`/timetable/${next.table}/${next.round}`)}
                className="learn-accent-pill flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-white/75">
                      {t.common.play}
                    </span>
                    <span className="block text-lg font-bold">
                      {t.timetable.table} {next.table} ·{' '}
                      {t.timetable.stageOf(
                        stageOfRound(next.round).stage,
                        lang === 'en'
                          ? stageOfRound(next.round).enTitle
                          : stageOfRound(next.round).thaiTitle,
                      )}
                    </span>
                  </span>
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  {t.timetable.approxMinutes}
                </span>
              </button>
            )}

            {/* Daily mix challenge — variety + spaced review, replayable. */}
            <MixChallengeCard
              ready={mixReady}
              claimed={mixClaimed}
              tableCount={mixTables.length}
              t={t}
            />

            {/* The table map. */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-white">
                {t.timetable.chooseTable}
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {(TABLE_ORDER as readonly number[]).map((table) => (
                  <TableCard
                    key={table}
                    table={table}
                    unlocked={isTableUnlocked(progress, table)}
                    stars={tableStars(progress, table)}
                    roundsCleared={tableRoundsCleared(progress, table)}
                    isNext={next?.table === table}
                    // Tap = play. Straight into the next round of that table
                    // (or a replay of the last round when complete) — no
                    // intermediate round-picker page.
                    playHref={`/timetable/${table}/${nextRoundInTable(progress, table)}`}
                    t={t}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function MixChallengeCard({
  ready,
  claimed,
  tableCount,
  t,
}: {
  ready: boolean;
  claimed: boolean;
  tableCount: number;
  t: Strings;
}) {
  const inner = (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
        ready
          ? 'border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-orange-500/10 hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/20'
          : 'border-white/10 bg-white/[0.02] opacity-60'
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          ready
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40'
            : 'bg-white/5 text-white/40'
        }`}
      >
        {ready ? <Shuffle className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-white">
          {t.timetable.mixTitle}{' '}
          <span className="font-semibold text-amber-200/90">
            {t.timetable.mixTag}
          </span>
        </h3>
        <p className="mt-0.5 text-sm text-white/65">
          {ready ? t.timetable.mixReady(tableCount) : t.timetable.mixLocked}
        </p>
      </div>
      {ready && (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
            claimed
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-amber-400/25 text-amber-200'
          }`}
        >
          {claimed
            ? t.timetable.mixClaimed
            : t.timetable.mixClaimToday(EXP_MIX_DAILY)}
        </span>
      )}
    </div>
  );

  if (!ready) return inner;
  return (
    <Link href="/timetable/mix" className="block">
      {inner}
    </Link>
  );
}

function TableCard({
  table,
  unlocked,
  stars,
  roundsCleared,
  isNext,
  playHref,
  t,
}: {
  table: number;
  unlocked: boolean;
  stars: number;
  roundsCleared: number;
  isNext: boolean;
  playHref: string;
  t: Strings;
}) {
  const done = stars >= STAGES_PER_TABLE;

  const wrapper = done
    ? 'border-emerald-400/40 bg-emerald-500/[0.08]'
    : isNext
      ? 'border-pink-400/80 bg-pink-500/[0.16] shadow-lg shadow-pink-500/30'
      : unlocked
        ? 'learn-card'
        : 'border-white/10 bg-white/[0.02] opacity-50';

  const content = (
    <div
      className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition ${wrapper} ${
        unlocked ? 'hover:scale-[1.03] active:scale-[0.98]' : ''
      }`}
    >
      {/* Big table number — the card's identity. */}
      <span
        className={`text-3xl font-extrabold sm:text-4xl ${
          done ? 'text-emerald-300' : unlocked ? 'text-white' : 'text-white/40'
        }`}
      >
        ×{table}
      </span>

      {/* Mastery stars. */}
      <span className="flex items-center gap-0.5">
        {Array.from({ length: STAGES_PER_TABLE }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < stars
                ? 'fill-current text-amber-300'
                : unlocked
                  ? 'text-white/25'
                  : 'text-white/15'
            }`}
          />
        ))}
      </span>

      {/* State line. */}
      {unlocked ? (
        <span
          className={`text-xs font-semibold ${
            done
              ? 'text-emerald-300'
              : isNext
                ? 'text-pink-300'
                : 'text-white/50'
          }`}
        >
          {done
            ? t.timetable.master
            : isNext
              ? t.timetable.playHere
              : t.timetable.roundsOf(roundsCleared, ROUNDS_PER_TABLE)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-white/40">
          <Lock className="h-3 w-3" /> {t.common.locked}
        </span>
      )}
    </div>
  );

  if (!unlocked) return content;
  return <Link href={playHref}>{content}</Link>;
}
