// components/lesson/LearnTopBar.tsx
//
// Sticky top bar for all /learn list pages (curriculum picker → chapter list).
// Intentionally lighter than GameHeader — no EXP/Level/Score (those belong to
// the legacy drill mode and would confuse learners since curriculum progress
// uses stars instead).

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, LogOut, Settings, Star } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import EnhancedSoundToggle from '@/components/game/EnhancedSoundToggle';
import type { User } from '@/types';

interface Props {
  user: User;
}

// Sum stars earned across every curriculum the user has touched.
const totalStarsAcrossCurricula = (user: User): number => {
  if (!user.curriculumProgress) return 0;
  return Object.values(user.curriculumProgress).reduce(
    (sum, p) => sum + (p.totalStarsEarned ?? 0),
    0,
  );
};

export default function LearnTopBar({ user }: Props) {
  const router = useRouter();
  const stars = totalStarsAcrossCurricula(user);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="glass-dark sticky top-0 z-40 border-b border-metaverse-purple/30">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 px-3 sm:px-6">
        {/* Left: avatar + name (single line, compact) */}
        <Link href="/my-avatar" className="flex min-w-0 items-center gap-2">
          {/* EnhancedAvatarDisplay's smallest size is 100x100. Wrap + scale it
            * down to fit a 36px slot in the 48px bar. overflow:hidden trims the
            * scaled box's empty padding. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <span className="block" style={{ transform: 'scale(0.36)', transformOrigin: 'center' }}>
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
          <p className="truncate text-sm font-bold text-white">
            {user.displayName || user.username}
          </p>
        </Link>

        {/* Right: stars + sound + settings + logout */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {stars > 0 && (
            <div className="glass flex h-7 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/5 px-2">
              <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span className="text-xs font-bold text-amber-200">
                {stars.toLocaleString()}
              </span>
            </div>
          )}

          <EnhancedSoundToggle />

          <motion.button
            onClick={() => router.push('/')}
            aria-label="กลับหน้าแรก"
            title="กลับหน้าแรก (เรียน / เล่นเกม)"
            className="glass flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={() => router.push('/profile')}
            aria-label="ตั้งค่า"
            className="glass flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4" />
          </motion.button>

          <motion.button
            onClick={handleSignOut}
            aria-label="ออกจากระบบ"
            className="glass flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
