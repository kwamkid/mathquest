// components/layout/UserMenu.tsx
//
// Circular avatar (profile-pic style) on the far right of the top bar. Tapping
// opens a dropdown: My Avatar / Shop / Setting / Log out. Replaces the old
// scattered header action icons (avatar link + shop + settings + logout).

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, ShoppingBag, Sparkles } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import EnhancedAvatarDisplay from '@/components/avatar/EnhancedAvatarDisplay';
import type { User } from '@/types';

interface Props {
  user: User;
}

export default function UserMenu({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside-click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push('/');
  };

  const items = [
    { label: 'My Avatar', href: '/my-avatar', icon: Sparkles },
    { label: 'Shop', href: '/rewards', icon: ShoppingBag },
    { label: 'Setting', href: '/profile', icon: Settings },
  ];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="เมนูผู้ใช้"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ring-2 ring-metaverse-purple/50 transition hover:ring-metaverse-pink/70 sm:h-11 sm:w-11"
      >
        <span
          className="block scale-[0.55] sm:scale-[0.5]"
          style={{ transformOrigin: 'center' }}
        >
          <EnhancedAvatarDisplay
            userId={user.id}
            avatarData={user.avatarData}
            basicAvatar={user.avatar}
            size="tiny"
            showEffects={false}
            showTitle={false}
            showAccessories
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-metaverse-purple/40 bg-[#15101f] shadow-2xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-bold text-white">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-white/50">Lv.{user.level}</p>
            </div>
            <nav className="p-1.5">
              {items.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4 shrink-0 text-metaverse-purple" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/15 hover:text-rose-200"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Log out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
