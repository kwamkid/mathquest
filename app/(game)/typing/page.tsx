// app/(game)/typing/page.tsx
//
// Typing landing — the unit map. A grid of unit cards (new keycaps + 3
// mastery stars) mirroring the timetable landing: earning a unit's FIRST
// star unlocks the next unit. EN (QWERTY) track only in v1; the Thai
// (Kedmanee) tab is a visible-but-disabled teaser.

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Keyboard, Lock, Play, Star } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useDeviceClass } from '@/lib/useDeviceClass';
import type { Strings } from '@/lib/i18n/strings';
import { FINGER_COLORS, LAYOUTS, fingerForChar } from '@/lib/typing/layouts';
import { STAGES_PER_UNIT, stageMeta, UNITS } from '@/lib/typing/config';
import {
  findNextStage,
  getTypingProgress,
  isUnitUnlocked,
  nextStageInUnit,
  unitStars,
} from '@/lib/typing/progress';

export default function TypingHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const device = useDeviceClass();
  const progress = getTypingProgress(user);

  const next = findNextStage(progress);
  const totalStars = UNITS.reduce(
    (sum, u) => sum + unitStars(progress, u.number),
    0,
  );
  const maxStars = UNITS.length * STAGES_PER_UNIT;

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
                    <Keyboard className="h-6 w-6" />
                  </span>
                  <h1 className="text-3xl font-bold text-white">
                    {t.typing.title}{' '}
                    <span className="text-white/60">{t.typing.titleTag}</span>
                  </h1>
                </div>
                <p className="mt-2 text-base text-white/70">{t.typing.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-4 py-2">
                <Star className="h-5 w-5 fill-current text-amber-300" />
                <span className="text-base font-bold text-amber-200">
                  {totalStars}/{maxStars}
                </span>
              </div>
            </header>

            {/* Phone notice — typing needs a real keyboard; tapping a unit on
                a phone lands on the "use a computer" card. Say so up front. */}
            {device === 'phone' && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/[0.08] px-4 py-3">
                <span className="text-xl" aria-hidden>
                  💻
                </span>
                <p className="text-sm leading-relaxed text-amber-100/90">
                  {t.typing.phoneBlockBody}
                </p>
              </div>
            )}

            {/* Track tabs — EN live, Thai teaser. */}
            <div className="flex items-center gap-2">
              <span className="learn-accent-pill rounded-full px-4 py-1.5 text-sm font-bold shadow-md shadow-pink-500/20">
                {t.typing.enTrackTab}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/40">
                <Lock className="h-3.5 w-3.5" />
                {t.typing.thTrackTabSoon}
              </span>
            </div>

            {/* Continue CTA. */}
            {next && (
              <button
                onClick={() => router.push(`/typing/${next.unit}/${next.stage}`)}
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
                      {t.typing.playNext(
                        next.unit,
                        next.stage,
                        lang === 'en'
                          ? stageMeta(next.unit, next.stage).enTitle
                          : stageMeta(next.unit, next.stage).thaiTitle,
                      )}
                    </span>
                  </span>
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  {t.typing.approxMinutes}
                </span>
              </button>
            )}

            {/* The unit map. */}
            <section>
              <h2 className="mb-3 text-lg font-bold text-white">
                {t.typing.chooseUnit}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {UNITS.map((u) => {
                  const nextStage = nextStageInUnit(progress, u.number);
                  const nextStageTitle =
                    lang === 'en'
                      ? stageMeta(u.number, nextStage).enTitle
                      : stageMeta(u.number, nextStage).thaiTitle;
                  return (
                    <UnitCard
                      key={u.number}
                      unit={u.number}
                      label={lang === 'en' ? u.enLabel : u.thaiLabel}
                      newKeys={u.newKeys}
                      unlocked={isUnitUnlocked(progress, u.number)}
                      stars={unitStars(progress, u.number)}
                      isNext={next?.unit === u.number}
                      // Tap = play. Straight into the stage to do next (or a
                      // replay of stage 3 when the unit is complete) — no
                      // intermediate stage-picker page.
                      playHref={`/typing/${u.number}/${nextStage}`}
                      // "ระดับ 1/3 · รู้จักแป้น" — names the sub-level the tap
                      // will start, so stage names never read as unit names.
                      nextStageLabel={t.typing.stageOf(nextStage, nextStageTitle)}
                      t={t}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function UnitCard({
  unit,
  label,
  newKeys,
  unlocked,
  stars,
  isNext,
  playHref,
  nextStageLabel,
  t,
}: {
  unit: number;
  label: string;
  newKeys: string[];
  unlocked: boolean;
  stars: number;
  isNext: boolean;
  playHref: string;
  nextStageLabel: string;
  t: Strings;
}) {
  const done = stars >= STAGES_PER_UNIT;

  const wrapper = done
    ? 'border-emerald-400/40 bg-emerald-500/[0.08]'
    : isNext
      ? 'border-pink-400/80 bg-pink-500/[0.16] shadow-lg shadow-pink-500/30'
      : unlocked
        ? 'learn-card'
        : 'border-white/10 bg-white/[0.02] opacity-50';

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition ${wrapper} ${
        unlocked ? 'hover:scale-[1.03] active:scale-[0.98]' : ''
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-wide text-white/45">
        {t.typing.unitWord} {unit}
      </span>

      {/* New keycaps — the card's identity. */}
      <span className="flex flex-wrap items-center justify-center gap-1">
        {newKeys.map((keyChar) => {
          const finger = fingerForChar(LAYOUTS.en, keyChar);
          const colors = finger ? FINGER_COLORS[finger] : null;
          return (
            <span
              key={keyChar}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-base font-extrabold uppercase ${
                unlocked && colors ? colors.active : 'bg-white/5 text-white/40'
              }`}
            >
              {keyChar}
            </span>
          );
        })}
      </span>

      <span className={`text-xs font-semibold ${unlocked ? 'text-white/60' : 'text-white/35'}`}>
        {label}
      </span>

      <span className="flex items-center gap-0.5">
        {Array.from({ length: STAGES_PER_UNIT }).map((_, i) => (
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

      {unlocked ? (
        <span
          className={`text-xs font-semibold ${
            done ? 'text-emerald-300' : isNext ? 'text-pink-300' : 'text-white/50'
          }`}
        >
          {done ? t.typing.master : nextStageLabel}
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
