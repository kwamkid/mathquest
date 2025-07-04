'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

// Avatar categories with emojis
const avatarCategories = {
  warriors: {
    title: 'นักรบ',
    avatars: [
      { id: 'knight', name: 'อัศวิน', emoji: '🤴' },
      { id: 'warrior', name: 'นักรบ', emoji: '🦸‍♂️' },
      { id: 'warrioress', name: 'นักรบหญิง', emoji: '🦸‍♀️' },
      { id: 'ninja', name: 'นินจา', emoji: '🥷' },
      { id: 'wizard', name: 'พ่อมด', emoji: '🧙‍♂️' },
      { id: 'witch', name: 'แม่มด', emoji: '🧙‍♀️' },
      { id: 'superhero', name: 'ซูเปอร์ฮีโร่', emoji: '🦹‍♂️' },
      { id: 'superheroine', name: 'ซูเปอร์ฮีโร่หญิง', emoji: '🦹‍♀️' },
      { id: 'vampire', name: 'แวมไพร์', emoji: '🧛‍♂️' },
      { id: 'vampiress', name: 'แวมไพร์หญิง', emoji: '🧛‍♀️' }
    ]
  },
  creatures: {
    title: 'สัตว์มหัศจรรย์',
    avatars: [
      { id: 'dragon', name: 'มังกร', emoji: '🐉' },
      { id: 'unicorn', name: 'ยูนิคอร์น', emoji: '🦄' },
      { id: 'fox', name: 'สุนัขจิ้งจอก', emoji: '🦊' },
      { id: 'lion', name: 'สิงโต', emoji: '🦁' },
      { id: 'tiger', name: 'เสือ', emoji: '🐯' },
      { id: 'wolf', name: 'หมาป่า', emoji: '🐺' },
      { id: 'bear', name: 'หมี', emoji: '🐻' },
      { id: 'panda', name: 'แพนด้า', emoji: '🐼' },
      { id: 'monkey', name: 'ลิง', emoji: '🐵' },
      { id: 'owl', name: 'นกฮูก', emoji: '🦉' }
    ]
  },
  mystical: {
    title: 'ผู้วิเศษ',
    avatars: [
      { id: 'fairy', name: 'นางฟ้า', emoji: '🧚‍♀️' },
      { id: 'fairy-man', name: 'นางฟ้าชาย', emoji: '🧚‍♂️' },
      { id: 'mage', name: 'จอมเวทย์', emoji: '🧙' },
      { id: 'genie', name: 'ยักษ์จินนี่', emoji: '🧞' },
      { id: 'mermaid', name: 'นางเงือก', emoji: '🧜‍♀️' },
      { id: 'merman', name: 'เงือกชาย', emoji: '🧜‍♂️' },
      { id: 'robot', name: 'หุ่นยนต์', emoji: '🤖' },
      { id: 'alien', name: 'เอเลี่ยน', emoji: '👽' },
      { id: 'ghost', name: 'ผี', emoji: '👻' },
      { id: 'zombie', name: 'ซอมบี้', emoji: '🧟' }
    ]
  }
};

interface AvatarSelectionProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
}

export default function AvatarSelection({ selectedAvatar, onSelectAvatar }: AvatarSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('warriors');

  // Get selected avatar details
  const getSelectedAvatarDetails = () => {
    for (const category of Object.values(avatarCategories)) {
      const avatar = category.avatars.find(a => a.id === selectedAvatar);
      if (avatar) return avatar;
    }
    return null;
  };

  const selectedAvatarDetails = getSelectedAvatarDetails();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        เลือกตัวละครของคุณ
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.entries(avatarCategories).map(([key, category]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all ${
              selectedCategory === key
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.title}
          </motion.button>
        ))}
      </div>

      {/* Avatar Grid */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8"
      >
        {avatarCategories[selectedCategory as keyof typeof avatarCategories].avatars.map((avatar) => (
          <motion.button
            key={avatar.id}
            onClick={() => onSelectAvatar(avatar.id)}
            className={`relative p-4 rounded-2xl transition-all ${
              selectedAvatar === avatar.id
                ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-xl scale-105'
                : 'bg-white hover:bg-gray-50 text-gray-800 shadow-md hover:shadow-lg'
            }`}
            whileHover={{ scale: selectedAvatar === avatar.id ? 1.05 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Selected Indicator */}
            {selectedAvatar === avatar.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-lg"
              >
                <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}

            {/* Avatar Emoji */}
            <div className="text-5xl mb-2">{avatar.emoji}</div>

            {/* Avatar Name */}
            <p className={`text-sm font-medium ${
              selectedAvatar === avatar.id ? 'text-white' : 'text-gray-700'
            }`}>
              {avatar.name}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {/* Selected Avatar Display */}
      {selectedAvatarDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-6 shadow-lg"
        >
          <p className="text-lg text-gray-600 mb-2">คุณเลือก:</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-6xl">{selectedAvatarDetails.emoji}</span>
            <span className="text-2xl font-bold text-red-600">
              {selectedAvatarDetails.name}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}