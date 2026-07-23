// app/(game)/typing/page.tsx
//
// Typing landing — the 100-day plan. ONE main path: a hero card for the
// current day's mission, a 10×10 dot grid showing the whole journey, and a
// (locked-until-day-100) Freestyle card. The old unit grid is gone — its
// finger/row jargon confused kids; day numbers + kid labels replaced it.
// Unit stars still live underneath (day slots 1-3 ARE the old stages), so
// nothing existing players earned is lost.

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Keyboard, Lock, Play, Zap } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useDeviceClass } from '@/lib/useDeviceClass';
import { dayPlan, PHASES, TOTAL_DAYS } from '@/lib/typing/days';
import { getTypingDayState } from '@/lib/typing/progress';

export default function TypingHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const device = useDeviceClass();

  const { currentDay, doneDays, streak } = getTypingDayState(user);
  const allDone = currentDay > TOTAL_DAYS;
  const plan = allDone ? null : dayPlan(currentDay);

  // Auto-scroll the day list (its own scrollbox) to the current mission —
  // manual math, not scrollIntoView, so the PAGE never jumps on load.
  const listRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = listRef.current;
    const row = currentRowRef.current;
    if (box && row) {
      box.scrollTop = Math.max(
        0,
        row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2,
      );
    }
  }, [currentDay]);

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
                    <span className="text-white/60">{t.typing.planTitle}</span>
                  </h1>
                </div>
                <p className="mt-2 text-base text-white/70">{t.typing.subtitle}</p>
              </div>
              {/* Streak — the reason to come back tomorrow. */}
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500/15 px-4 py-2 text-base font-bold text-orange-300">
                  {t.typing.streakLabel(streak.current)}
                </span>
                {streak.best > streak.current && (
                  <span className="rounded-full bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/55">
                    {t.typing.streakBest(streak.best)}
                  </span>
                )}
              </div>
            </header>

            {/* Phone notice — typing needs a real keyboard; tapping a mission
                on a phone lands on the "use a computer" card. Say so up front. */}
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

            {/* Hero — the next mission (no daily lock: finish one, the next
                opens right away; the streak line handles "come back"). */}
            {plan ? (
              <button
                onClick={() => router.push(`/typing/day/${currentDay}`)}
                className="learn-accent-pill flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-white/75">
                      {t.typing.missionNext}
                    </span>
                    <span className="block text-lg font-bold">
                      {t.typing.dayOf(currentDay)} ·{' '}
                      {lang === 'en' ? plan.labelEn : plan.labelTh}
                    </span>
                  </span>
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                  {t.typing.approxMinutes}
                </span>
              </button>
            ) : (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.1] px-5 py-4 text-center">
                <p className="text-lg font-bold text-emerald-200">
                  {t.typing.planComplete}
                </p>
              </div>
            )}

            {/* The journey — every day listed WITH what it teaches (the dot
                grid hid the labels behind hover, which kids never see).
                Grouped by phase, scrolls in its own box, auto-centered on the
                current mission. */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {t.typing.planTitle}
                </h2>
                <span className="text-sm font-semibold text-white/55">
                  {t.typing.daysDone(doneDays.size)}
                </span>
              </div>
              {/* Progress bar — the 43/100 feeling the dots used to give. */}
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                  style={{ width: `${(doneDays.size / TOTAL_DAYS) * 100}%` }}
                />
              </div>
              <div
                ref={listRef}
                className="custom-scrollbar learn-card max-h-[26rem] overflow-y-auto rounded-2xl"
              >
                {PHASES.map((ph) => (
                  <div key={ph.key}>
                    {/* Phase header — sticky inside the scrollbox. */}
                    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/10 bg-[#0a1410]/95 px-4 py-2 backdrop-blur">
                      <span aria-hidden>{ph.emoji}</span>
                      <span className="text-sm font-bold text-white/85">
                        {lang === 'en' ? ph.labelEn : ph.labelTh}
                      </span>
                      <span className="text-sm text-white/40">
                        {ph.from}-{ph.to}
                      </span>
                    </div>
                    {Array.from(
                      { length: ph.to - ph.from + 1 },
                      (_, i) => ph.from + i,
                    ).map((n) => {
                      const done = doneDays.has(n);
                      const isCurrent = n === currentDay;
                      const p = dayPlan(n);
                      const label = lang === 'en' ? p.labelEn : p.labelTh;
                      const row = (
                        <div
                          ref={isCurrent ? currentRowRef : undefined}
                          className={`flex items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 ${
                            isCurrent
                              ? 'bg-pink-500/[0.14] ring-1 ring-inset ring-pink-400/50'
                              : done
                                ? 'hover:bg-white/[0.04]'
                                : 'opacity-45'
                          }`}
                        >
                          {/* Day number chip */}
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums ${
                              isCurrent
                                ? 'bg-pink-500 text-white'
                                : done
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-white/[0.06] text-white/45'
                            }`}
                          >
                            {n}
                          </span>
                          <span
                            className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                              isCurrent
                                ? 'text-white'
                                : done
                                  ? 'text-white/80'
                                  : 'text-white/50'
                            }`}
                          >
                            {label}
                          </span>
                          {isCurrent ? (
                            <span className="learn-accent-pill flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold">
                              <Play className="h-3.5 w-3.5 fill-current" />
                              {t.common.play}
                            </span>
                          ) : done ? (
                            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 shrink-0 text-white/25" />
                          )}
                        </div>
                      );
                      return done || isCurrent ? (
                        <Link key={n} href={`/typing/day/${n}`} className="block">
                          {row}
                        </Link>
                      ) : (
                        <div key={n}>{row}</div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-white/45">{t.typing.dotHint}</p>
            </section>

            {/* Freestyle — the endgame WPM arena. Visible from day 1 so the
                goal is always on screen; a real door once day 100 is done. */}
            {(() => {
              const card = (
                <section
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${
                    allDone
                      ? 'border-cyan-400/40 bg-cyan-500/[0.08] transition hover:bg-cyan-500/[0.14]'
                      : 'border-white/10 bg-white/[0.03] opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        allDone
                          ? 'bg-cyan-500/25 text-cyan-200'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      <Zap className="h-5 w-5" />
                    </span>
                    <div>
                      <p
                        className={`font-bold ${
                          allDone ? 'text-cyan-100' : 'text-white/70'
                        }`}
                      >
                        {t.typing.freestyleTitle}
                      </p>
                      <p className="text-sm text-white/45">
                        {allDone
                          ? user?.typingBestWpm
                            ? t.typing.myBest(user.typingBestWpm)
                            : t.typing.freestylePlay
                          : t.typing.freestyleLocked}
                      </p>
                    </div>
                  </div>
                  {!allDone && <Lock className="h-5 w-5 text-white/30" />}
                </section>
              );
              return allDone ? (
                <Link href="/typing/freestyle" className="block">
                  {card}
                </Link>
              ) : (
                card
              );
            })()}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
