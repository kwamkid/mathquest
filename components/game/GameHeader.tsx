// components/game/GameHeader.tsx
'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Flame } from 'lucide-react';
import SoundToggle from './SoundToggle';

interface GameHeaderProps {
  user: User;
}

export default function GameHeader({ user }: GameHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Get grade display name
  const getGradeDisplayName = (grade: string): string => {
    const gradeMap: Record<string, string> = {
      K1: 'อนุบาล 1',
      K2: 'อนุบาล 2',
      K3: 'อนุบาล 3',
      P1: 'ประถม 1',
      P2: 'ประถม 2',
      P3: 'ประถม 3',
      P4: 'ประถม 4',
      P5: 'ประถม 5',
      P6: 'ประถม 6',
      M1: 'มัธยม 1',
      M2: 'มัธยม 2',
      M3: 'มัธยม 3',
      M4: 'มัธยม 4',
      M5: 'มัธยม 5',
      M6: 'มัธยม 6',
    };
    return gradeMap[grade] || grade;
  };

  // Get avatar emoji from avatar id
  const getAvatarEmoji = (avatarId: string): string => {
    const avatarMap: Record<string, string> = {
      // Warriors
      'knight': '🤴',
      'warrior': '🦸‍♂️',
      'warrioress': '🦸‍♀️',
      'ninja': '🥷',
      'wizard': '🧙‍♂️',
      'witch': '🧙‍♀️',
      'superhero': '🦹‍♂️',
      'superheroine': '🦹‍♀️',
      'vampire': '🧛‍♂️',
      'vampiress': '🧛‍♀️',
      // Creatures
      'dragon': '🐉',
      'unicorn': '🦄',
      'fox': '🦊',
      'lion': '🦁',
      'tiger': '🐯',
      'wolf': '🐺',
      'bear': '🐻',
      'panda': '🐼',
      'monkey': '🐵',
      'owl': '🦉',
      // Mystical
      'fairy': '🧚‍♀️',
      'fairy-man': '🧚‍♂️',
      'mage': '🧙',
      'genie': '🧞',
      'mermaid': '🧜‍♀️',
      'merman': '🧜‍♂️',
      'robot': '🤖',
      'alien': '👽',
      'ghost': '👻',
      'zombie': '🧟'
    };
    
    return avatarMap[avatarId] || '👤';
  };

  return (
    <header className="glass-dark border-b border-metaverse-purple/30 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Mobile Layout - 2 rows */}
        <div className="md:hidden">
          {/* Row 1: User Info + Actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <motion.div
                className="text-3xl filter drop-shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                {getAvatarEmoji(user.avatar)}
              </motion.div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {user.displayName || user.username}
                </h3>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span>{getGradeDisplayName(user.grade)}</span>
                  <span className="text-metaverse-purple font-semibold">Lv.{user.level}</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-orange-400 font-semibold">{user.dailyStreak}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <SoundToggle />
              <motion.button
                onClick={() => router.push('/profile')}
                className="p-1.5 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleSignOut}
                className="p-1.5 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          
          {/* Row 2: Stats */}
          <div className="flex items-center gap-2">
            <motion.div 
              className="flex-1 text-center glass-dark px-3 py-1.5 rounded-lg border border-metaverse-purple/20"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {user.totalScore.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">คะแนนรวม</p>
            </motion.div>
            <motion.div 
              className="flex-1 text-center glass-dark px-3 py-1.5 rounded-lg border border-metaverse-purple/20"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                {user.experience}
              </p>
              <p className="text-xs text-white/60">EXP</p>
            </motion.div>
          </div>
        </div>

        {/* Desktop Layout - Original */}
        <div className="hidden md:flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <motion.div
              className="text-4xl filter drop-shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              {getAvatarEmoji(user.avatar)}
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {user.displayName || user.username}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>{getGradeDisplayName(user.grade)}</span>
                <span>•</span>
                <span className="text-metaverse-purple font-semibold">Level {user.level}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-semibold">{user.dailyStreak}</span> วัน
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Stats + Actions */}
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="text-center glass-dark px-4 py-2 rounded-xl border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <div>
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {user.totalScore.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/60">คะแนนรวม</p>
                </div>
              </motion.div>
              <motion.div 
                className="text-center glass-dark px-4 py-2 rounded-xl border border-metaverse-purple/20"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-pink">
                  {user.experience}
                </p>
                <p className="text-xs text-white/60">EXP</p>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <SoundToggle />
              
              <motion.button
                onClick={() => router.push('/profile')}
                className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={handleSignOut}
                className="p-2 glass rounded-full transition hover:bg-white/10 text-white/70 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}