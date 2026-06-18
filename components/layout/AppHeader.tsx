// components/layout/AppHeader.tsx
//
// Unified top bar for the whole app. Left → right:
//   Logo · [sub: back + title] · spacer · score/EXP · sound toggles · UserMenu
//
// The avatar lives on the FAR RIGHT as a circular profile pic; tapping it opens
// a dropdown (My Avatar / Shop / Setting / Log out) — see UserMenu. Sound is two
// inline icon toggles (see SoundToggles). Two variants:
//   - "main": home / mode landings. Left side is just the logo.
//   - "sub" : profile / rewards / etc. Left side adds a back button + title.
//
// hideActions hides the stats + sound + menu — used by /play mid-game so the
// learner can't accidentally bail mid-question.

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pi } from 'lucide-react';
import SoundToggles from './SoundToggles';
import UserMenu from './UserMenu';
import type { User } from '@/types';

interface AppHeaderProps {
  user: User;
  variant?: 'main' | 'sub';
  // Sub-variant props
  title?: string;
  subtitle?: string;
  titleIcon?: ReactNode;
  backHref?: string;
  // Right-aligned extras (e.g. grade selector, save buttons). Rendered before
  // the stats block on desktop; collapses below the title on mobile.
  extras?: ReactNode;
  // Hide all actions (stats / sound / menu). Stats stay hidden too.
  hideActions?: boolean;
}

export default function AppHeader({
  user,
  variant = 'main',
  title,
  subtitle,
  titleIcon,
  backHref,
  extras,
  hideActions = false,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="glass-dark sticky top-0 z-40 border-b border-metaverse-purple/30">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-3 py-2.5 sm:min-h-[4.25rem] sm:gap-3 sm:px-4">
        {/* Logo — far left, one-tap home. */}
        <Link
          href="/"
          aria-label="กลับหน้าแรก"
          title="MathQuest — หน้าแรก"
          className="group flex shrink-0 items-center rounded-lg p-1 transition hover:bg-white/5"
        >
          <Pi
            className="h-7 w-7 text-metaverse-purple transition group-hover:text-metaverse-pink sm:h-8 sm:w-8"
            style={{ filter: 'drop-shadow(0 0 8px rgba(147,51,234,0.45))' }}
          />
        </Link>

        {/* Sub-variant: back button + page title. */}
        {variant === 'sub' && (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => (backHref ? router.push(backHref) : router.back())}
              aria-label="ย้อนกลับ"
              className="glass flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="flex min-w-0 items-center gap-1.5 truncate text-base font-bold text-white sm:text-lg">
                {titleIcon}
                <span className="truncate">{title}</span>
              </h1>
              {subtitle && (
                <p className="hidden truncate text-[11px] text-white/60 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Spacer pushes the right cluster to the edge. */}
        <div className="flex-1" />

        {/* Right cluster: extras · score/EXP · sound · user menu */}
        {!hideActions && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {extras && (
              <div className="hidden items-center gap-1 sm:flex">{extras}</div>
            )}

            {/* Score + EXP — compact on phones; labels drop on mobile. */}
            <div className="glass-dark flex items-center gap-1 rounded-full border border-metaverse-purple/30 px-1.5 py-0.5 sm:gap-2 sm:px-3 sm:py-1">
              <span className="hidden text-[10px] uppercase tracking-wide text-white/50 sm:inline">
                คะแนน
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-[11px] font-bold text-transparent sm:text-sm">
                {user.totalScore.toLocaleString()}
              </span>
              <span className="h-3 w-px bg-white/20" aria-hidden />
              <span className="hidden text-[10px] uppercase tracking-wide text-white/50 sm:inline">
                EXP
              </span>
              <span className="bg-gradient-to-r from-metaverse-purple to-metaverse-pink bg-clip-text text-[11px] font-bold text-transparent sm:text-sm">
                {user.experience.toLocaleString()}
              </span>
            </div>

            <SoundToggles />

            <UserMenu user={user} />
          </div>
        )}
      </div>

      {/* Mobile: extras row collapses below the main bar to avoid cramping */}
      {extras && !hideActions && (
        <div className="border-t border-white/5 px-3 py-1.5 sm:hidden">
          <div className="flex items-center gap-2 overflow-x-auto">{extras}</div>
        </div>
      )}
    </header>
  );
}
