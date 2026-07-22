// components/layout/AppHeader.tsx
//
// Unified top bar for the whole app. Left → right:
//   Logo · [sub: back + title] · spacer · coins · sound toggles · UserMenu
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
import { ArrowLeft, Coins, Pi } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import SoundToggles from './SoundToggles';
import UserMenu from './UserMenu';
import { useLanguage } from '@/lib/i18n/LanguageContext';
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
  const { t } = useLanguage();

  return (
    <header className="glass-dark sticky top-0 z-40 border-b border-metaverse-purple/30">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 px-3 py-2.5 sm:min-h-[4.25rem] sm:gap-3 sm:px-4">
        {/* Logo — far left, one-tap home. */}
        <Link
          href="/"
          aria-label={t.common.backHome}
          title="MathQuest"
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
              aria-label={t.common.back}
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
                <p className="hidden truncate text-xs text-white/60 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Spacer pushes the right cluster to the edge. */}
        <div className="flex-1" />

        {/* Right cluster: extras · coins · sound · user menu */}
        {!hideActions && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {extras && (
              <div className="hidden items-center gap-1 sm:flex">{extras}</div>
            )}

            {/* เหรียญ (spendable coins = experience) — the ONE number kids see. */}
            <div className="glass-dark flex items-center gap-1.5 rounded-full border border-amber-400/30 px-2 py-1 sm:gap-2 sm:px-3">
              <Coins className="h-3.5 w-3.5 text-amber-300 sm:h-4 sm:w-4" />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-xs font-bold text-transparent sm:text-sm">
                {user.experience.toLocaleString()}
              </span>
            </div>

            <LanguageToggle />

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
