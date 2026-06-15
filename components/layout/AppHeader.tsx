// components/layout/AppHeader.tsx
//
// Unified top bar for the whole app — replaces GameHeader, LearnTopBar, and
// the inline headers each sub-page used to roll on its own.
//
// Two variants share the same stats block on the right (score + EXP) so the
// numbers stay in one place no matter which page the learner is on:
//   - "main" (variant='main'): used by /play, /learn list, root. Left side
//     shows avatar + name + grade/level, plus the prominent Shop button.
//   - "sub"  (variant='sub'):  used by /profile, /rewards, /highscores, etc.
//     Left side shows a back button + page title; optional `extras` slot
//     accepts page-specific controls (grade selector, save buttons, …).
//
// hideActions hides everything but the avatar — used by /play while a game is
// in progress so the learner can't accidentally bail mid-question.

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  LogOut,
  Pi,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import EnhancedSoundToggle from '@/components/game/EnhancedSoundToggle';
import type { User } from '@/types';

const GRADE_DISPLAY: Record<string, string> = {
  K1: 'อนุบาล 1', K2: 'อนุบาล 2', K3: 'อนุบาล 3',
  P1: 'ประถม 1', P2: 'ประถม 2', P3: 'ประถม 3',
  P4: 'ประถม 4', P5: 'ประถม 5', P6: 'ประถม 6',
  M1: 'มัธยม 1', M2: 'มัธยม 2', M3: 'มัธยม 3',
  M4: 'มัธยม 4', M5: 'มัธยม 5', M6: 'มัธยม 6',
};

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
  // Hide all action buttons (Shop/Home/Settings/Logout). Stats stay visible.
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
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const gradeLabel = GRADE_DISPLAY[user.grade] ?? user.grade;

  return (
    <header className="glass-dark sticky top-0 z-40 border-b border-metaverse-purple/30">
      <div className="mx-auto flex min-h-12 max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:gap-3 sm:px-4">
        {/* Logo — always present on the far left so users have a one-tap path
          * back to the home screen no matter which page they're on. */}
        <Link
          href="/"
          aria-label="กลับหน้าแรก"
          title="MathQuest — หน้าแรก"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 transition hover:bg-white/5"
        >
          <Pi
            className="h-6 w-6 text-metaverse-purple transition group-hover:text-metaverse-pink sm:h-7 sm:w-7"
            style={{ filter: 'drop-shadow(0 0 8px rgba(147,51,234,0.45))' }}
          />
          <span className="hidden text-sm font-bold text-white md:block">
            Math
            <span className="bg-gradient-to-r from-metaverse-purple to-metaverse-red bg-clip-text text-transparent">
              Quest
            </span>
          </span>
        </Link>

        {/* Left side: avatar+name (main) or back+title (sub) */}
        {variant === 'main' ? (
          <Link
            href="/my-avatar"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <span
                className="block"
                style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}
              >
                <EnhancedAvatarDisplay
                  userId={user.id}
                  avatarData={user.avatarData}
                  basicAvatar={user.avatar}
                  size="tiny"
                  showEffects={false}
                  showTitle={false}
                  showAccessories={true}
                />
              </span>
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white sm:text-sm">
                {user.displayName || user.username}
              </p>
              <p className="hidden text-[10px] text-white/60 sm:block">
                {gradeLabel} · Lv.{user.level}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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

        {/* Right side: extras + stats + actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {extras && (
            <div className="hidden items-center gap-1 sm:flex">{extras}</div>
          )}

          {/* Score + EXP — always visible (the unified stats this whole
            * refactor exists for). Compact pill so both numbers fit on phones. */}
          <div className="glass-dark flex items-center gap-1 rounded-full border border-metaverse-purple/30 px-2 py-1 sm:gap-2 sm:px-3">
            <span className="text-[9px] uppercase tracking-wide text-white/50 sm:text-[10px]">
              คะแนน
            </span>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-xs font-bold text-transparent sm:text-sm">
              {user.totalScore.toLocaleString()}
            </span>
            <span className="h-3 w-px bg-white/20" aria-hidden />
            <span className="text-[9px] uppercase tracking-wide text-white/50 sm:text-[10px]">
              EXP
            </span>
            <span className="bg-gradient-to-r from-metaverse-purple to-metaverse-pink bg-clip-text text-xs font-bold text-transparent sm:text-sm">
              {user.experience.toLocaleString()}
            </span>
          </div>

          {!hideActions && (
            <>
              <motion.button
                onClick={() => router.push('/')}
                aria-label="กลับหน้าแรก"
                title="กลับหน้าแรก (เรียน / เล่นเกม)"
                className="glass flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="h-3.5 w-3.5" />
              </motion.button>

              {variant === 'main' && (
                <Link
                  href="/rewards"
                  aria-label="ร้านรางวัล"
                  title="ร้านรางวัล"
                  className="relative hidden sm:block"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                    <ShoppingBag className="h-3.5 w-3.5 text-white" />
                  </div>
                </Link>
              )}

              <EnhancedSoundToggle />

              <motion.button
                onClick={() => router.push('/profile')}
                aria-label="ตั้งค่า"
                className="glass hidden h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:flex"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-3.5 w-3.5" />
              </motion.button>

              <motion.button
                onClick={handleSignOut}
                aria-label="ออกจากระบบ"
                className="glass hidden h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:flex"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: extras row collapses below the main bar to avoid cramping */}
      {extras && (
        <div className="border-t border-white/5 px-3 py-1.5 sm:hidden">
          <div className="flex items-center gap-2 overflow-x-auto">{extras}</div>
        </div>
      )}
    </header>
  );
}
