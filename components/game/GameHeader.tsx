'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

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
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <motion.div
              className="text-4xl"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              {getAvatarEmoji(user.avatar)}
            </motion.div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                {user.displayName || user.username}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{getGradeDisplayName(user.grade)}</span>
                <span>•</span>
                <span>ระดับ {user.level}</span>
                <span>•</span>
                <span>🔥 {user.dailyStreak} วัน</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{user.totalScore}</p>
              <p className="text-xs text-gray-600">คะแนนรวม</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{user.experience}</p>
              <p className="text-xs text-gray-600">EXP</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">⚙️</span>
            </motion.button>
            
            <motion.button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">🚪</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}