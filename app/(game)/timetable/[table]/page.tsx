// app/(game)/timetable/[table]/page.tsx
//
// One table's (แม่) detail: its 3 stages (ฝึกจำ → ปนแม่เก่า → มาสเตอร์), each
// worth a star. Rounds inside an unlocked stage are freely playable in ANY
// order — only stages gate each other. Includes a peek-able reference chart
// so kids can review the table before drilling it.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
  Play,
  Star,
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Lang, Strings } from '@/lib/i18n/strings';
import {
  MULTIPLICAND_MAX,
  STAGES,
  STAGES_PER_TABLE,
  TABLE_ORDER,
  type StageDef,
} from '@/lib/timetable/config';
import {
  getTimetableProgress,
  isRoundCleared,
  isStageComplete,
  isStageUnlocked,
  isTableUnlocked,
  tableStars,
} from '@/lib/timetable/progress';
import type { CurriculumProgress } from '@/types/curriculum';

export default function TimetableTablePage() {
  const params = useParams();
  const table = Number(params.table);
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const progress = getTimetableProgress(user);

  const valid = TABLE_ORDER.includes(table as (typeof TABLE_ORDER)[number]);
  const unlocked = valid && isTableUnlocked(progress, table);

  if (!valid || !unlocked) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <p className="text-lg font-semibold text-white">
            {valid ? t.timetable.tableLocked : t.timetable.tableNotFound}
          </p>
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

  const stars = tableStars(progress, table);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && (
          <AppHeader
            user={user}
            variant="sub"
            title={`${t.timetable.table} ${table}`}
            subtitle={`${t.timetable.title} · ${t.timetable.titleTag}`}
            backHref="/timetable"
          />
        )}
        <div className="px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-2xl space-y-5">
            {/* Table identity + earned stars. */}
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="learn-accent-pill flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold shadow-lg shadow-pink-500/30">
                  ×{table}
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {t.timetable.table} {table}
                  </h1>
                  <p className="text-sm text-white/60">
                    {t.timetable.collectStars(STAGES_PER_TABLE)}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: STAGES_PER_TABLE }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-7 w-7 ${
                      i < stars ? 'fill-current text-amber-300' : 'text-white/20'
                    }`}
                  />
                ))}
              </span>
            </header>

            <ReferenceChart table={table} t={t} />

            {STAGES.map((stage) => (
              <StageCard
                key={stage.stage}
                table={table}
                stage={stage}
                progress={progress}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

// Collapsible "peek at the table" reference — review before drilling.
function ReferenceChart({ table, t }: { table: number; t: Strings }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="learn-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white/85">
          <BookOpenCheck className="h-4 w-4 text-cyan-300" />
          {t.timetable.peekChart(table)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-t border-white/10 p-4 sm:grid-cols-3">
          {Array.from({ length: MULTIPLICAND_MAX }, (_, i) => i + 1).map((n) => (
            <p key={n} className="text-sm tabular-nums text-white/80">
              {table} × {n} ={' '}
              <span className="font-bold text-white">{table * n}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function StageCard({
  table,
  stage,
  progress,
  lang,
  t,
}: {
  table: number;
  stage: StageDef;
  progress: CurriculumProgress | undefined;
  lang: Lang;
  t: Strings;
}) {
  const unlocked = isStageUnlocked(progress, table, stage.stage);
  const complete = isStageComplete(progress, table, stage.stage);

  return (
    <section
      className={`overflow-hidden rounded-2xl ${
        complete
          ? 'border border-emerald-400/30 bg-emerald-500/[0.07]'
          : unlocked
            ? 'learn-card'
            : 'border border-white/10 bg-white/[0.02] opacity-55'
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <h2 className="flex items-center gap-2 text-base font-bold text-white">
          <span
            className={`flex items-center gap-0.5 ${
              complete ? 'text-amber-300' : 'text-white/30'
            }`}
          >
            {Array.from({ length: stage.stage }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${complete ? 'fill-current' : ''}`}
              />
            ))}
          </span>
          {t.timetable.stageWord} {stage.stage} ·{' '}
          {lang === 'en' ? stage.enTitle : stage.thaiTitle}
          {lang === 'th' && (
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-200">
              {stage.enTitle}
            </span>
          )}
        </h2>
        {complete ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400/80" />
        ) : !unlocked ? (
          <Lock className="h-4 w-4 shrink-0 text-white/40" />
        ) : null}
      </div>
      <p className="px-4 pb-1 pt-0.5 text-xs text-white/55">
        {lang === 'en' ? stage.enHint : stage.thaiHint}
      </p>

      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
        {stage.rounds.map((r) => {
          const cleared = isRoundCleared(progress, table, r.round);
          const row = (
            <div
              className={`flex items-center gap-2.5 rounded-xl p-3 transition ${
                cleared
                  ? 'bg-emerald-500/[0.1]'
                  : unlocked
                    ? 'bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.98]'
                    : 'bg-white/[0.02]'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  cleared
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : unlocked
                      ? 'learn-accent-pill shadow-md shadow-pink-500/20'
                      : 'bg-white/5 text-white/30'
                }`}
              >
                {cleared ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : unlocked ? (
                  <Play className="h-4 w-4 fill-current" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </span>
              <span
                className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                  cleared
                    ? 'text-white/55 line-through'
                    : unlocked
                      ? 'text-white'
                      : 'text-white/40'
                }`}
              >
                {lang === 'en' ? r.enLabel : r.thaiLabel}
              </span>
            </div>
          );

          if (!unlocked) return <div key={r.round}>{row}</div>;
          return (
            <Link key={r.round} href={`/timetable/${table}/${r.round}`}>
              {row}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
