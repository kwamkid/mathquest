// app/(game)/typing/[unit]/page.tsx
//
// One unit's detail: the finger lesson (keyboard preview highlighting the
// unit's new keys + which finger owns each) and the 3 stage rows (Keys →
// Combos → Words/Runs), each worth a star. Mirrors the timetable table page.

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Lock, Play, Star } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AppHeader from '@/components/layout/AppHeader';
import VirtualKeyboard from '@/components/typing/VirtualKeyboard';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { FINGER_COLORS, LAYOUTS, fingerForChar, fingerName } from '@/lib/typing/layouts';
import {
  STAGES_PER_UNIT,
  stageMeta,
  unitDef,
} from '@/lib/typing/config';
import {
  getTypingProgress,
  isStageCleared,
  isStageUnlocked,
  isUnitUnlocked,
  unitStars,
} from '@/lib/typing/progress';

export default function TypingUnitPage() {
  const params = useParams();
  const unit = Number(params.unit);
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const progress = getTypingProgress(user);

  const def = unitDef(unit);
  const unlocked = !!def && isUnitUnlocked(progress, unit);

  if (!def || !unlocked) {
    return (
      <AuthGuard>
        <div className="learn-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold text-white">
            {def ? t.typing.unitLocked : t.typing.unitNotFound}
          </p>
          <Link
            href="/typing"
            className="learn-accent-pill rounded-2xl px-6 py-3 font-bold shadow-lg shadow-pink-500/30"
          >
            {t.typing.backToTyping}
          </Link>
        </div>
      </AuthGuard>
    );
  }

  const stars = unitStars(progress, unit);

  return (
    <AuthGuard>
      <div className="learn-bg min-h-screen">
        {user && (
          <AppHeader
            user={user}
            variant="sub"
            title={`${t.typing.unitWord} ${unit} · ${lang === 'en' ? def.enLabel : def.thaiLabel}`}
            subtitle={`${t.typing.title} · ${t.typing.titleTag}`}
            backHref="/typing"
          />
        )}
        <div className="px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-2xl space-y-5">
            {/* Unit identity: new keycaps + stars. */}
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  {def.newKeys.map((keyChar) => (
                    <KeyCap key={keyChar} char={keyChar} />
                  ))}
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {lang === 'en' ? def.enLabel : def.thaiLabel}
                  </h1>
                  <p className="text-sm text-white/60">
                    {t.typing.collectStars(STAGES_PER_UNIT)}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: STAGES_PER_UNIT }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-7 w-7 ${
                      i < stars ? 'fill-current text-amber-300' : 'text-white/20'
                    }`}
                  />
                ))}
              </span>
            </header>

            {/* Finger lesson: which finger hits the new keys. */}
            <div className="learn-card rounded-2xl p-4">
              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
                {def.newKeys.map((keyChar) => {
                  const finger = fingerForChar(LAYOUTS.en, keyChar);
                  return (
                    <span key={keyChar} className="text-sm font-semibold text-white/85">
                      {t.typing.fingerHint(
                        keyChar.toUpperCase(),
                        finger ? fingerName(finger)[lang] : '',
                      )}
                    </span>
                  );
                })}
                {unit === 1 && (
                  <span className="text-sm font-semibold text-white/85">
                    {t.typing.fingerHint(t.typing.spaceKey, fingerName('thumb')[lang])}
                  </span>
                )}
              </div>
              <VirtualKeyboard
                emphasizeKeys={unit === 1 ? [...def.newKeys, ' '] : def.newKeys}
                showLegend
              />
            </div>

            {/* Stage rows. */}
            <div className="space-y-3">
              {Array.from({ length: STAGES_PER_UNIT }, (_, i) => i + 1).map(
                (stage) => {
                  const meta = stageMeta(unit, stage);
                  const cleared = isStageCleared(progress, unit, stage);
                  const stageOpen = isStageUnlocked(progress, unit, stage);

                  const row = (
                    <div
                      className={`flex items-center gap-3 rounded-2xl p-4 transition ${
                        cleared
                          ? 'border border-emerald-400/30 bg-emerald-500/[0.07]'
                          : stageOpen
                            ? 'learn-card hover:bg-white/[0.04] active:scale-[0.99]'
                            : 'border border-white/10 bg-white/[0.02] opacity-55'
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          cleared
                            ? 'bg-emerald-400/15 text-emerald-300'
                            : stageOpen
                              ? 'learn-accent-pill shadow-md shadow-pink-500/20'
                              : 'bg-white/5 text-white/30'
                        }`}
                      >
                        {cleared ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : stageOpen ? (
                          <Play className="h-5 w-5 fill-current" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`flex items-center gap-2 text-base font-bold ${
                            cleared ? 'text-white/55 line-through' : 'text-white'
                          }`}
                        >
                          {t.typing.stageWord} {stage} ·{' '}
                          {lang === 'en' ? meta.enTitle : meta.thaiTitle}
                          {lang === 'th' && (
                            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-200 no-underline">
                              {meta.enTitle}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-white/55">
                          {lang === 'en' ? meta.enHint : meta.thaiHint}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-white/45">
                        {t.typing.approxMinutes}
                        <Star
                          className={`h-5 w-5 ${
                            cleared ? 'fill-current text-amber-300' : 'text-white/25'
                          }`}
                        />
                      </span>
                    </div>
                  );

                  if (!stageOpen) return <div key={stage}>{row}</div>;
                  return (
                    <Link key={stage} href={`/typing/${unit}/${stage}`}>
                      {row}
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

// Mini keycap tinted by its finger color.
function KeyCap({ char }: { char: string }) {
  const finger = fingerForChar(LAYOUTS.en, char);
  const colors = finger ? FINGER_COLORS[finger] : null;
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-extrabold uppercase shadow-lg ${
        colors ? colors.active : 'bg-white/10 text-white'
      }`}
    >
      {char}
    </span>
  );
}
