'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { basicAvatars } from '@/lib/data/avatars';

interface AvatarSelectionProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
}

export default function AvatarSelection({ selectedAvatar, onSelectAvatar }: AvatarSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('warriors');

  // Get selected avatar details
  const getSelectedAvatarDetails = () => {
    return basicAvatars.find(a => a.id === selectedAvatar);
  };

  const selectedAvatarDetails = getSelectedAvatarDetails();

  // Filter avatars by category
  const getAvatarsByCategory = (category: string) => {
    return basicAvatars.filter(a => a.category === category);
  };

  // Category data
  const categories = [
    { id: 'warriors', title: 'นักรบ', icon: <Shield className="w-5 h-5" /> },
    { id: 'creatures', title: 'สัตว์มหัศจรรย์', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'mystical', title: 'ผู้วิเศษ', icon: <Zap className="w-5 h-5" /> }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        เลือกตัวละครของคุณ
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'metaverse-button text-white shadow-lg'
                : 'glass text-white/70 hover:text-white hover:bg-white/10 border border-metaverse-purple/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.icon}
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
        {getAvatarsByCategory(selectedCategory).map((avatar) => (
          <motion.button
            key={avatar.id}
            onClick={() => onSelectAvatar(avatar.id)}
            className={`relative p-4 rounded-2xl transition-all ${
              selectedAvatar === avatar.id
                ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-red text-white shadow-xl scale-105 border-2 border-white/30'
                : 'glass hover:bg-white/10 text-white border border-metaverse-purple/30 hover:border-metaverse-purple/60'
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
                className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1 shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}

            {/* Glow effect for selected */}
            {selectedAvatar === avatar.id && (
              <div className="absolute inset-0 rounded-2xl bg-metaverse-purple/20 blur-xl -z-10" />
            )}

            {/* Avatar Emoji */}
            <motion.div 
              className="text-5xl mb-2 filter drop-shadow-lg"
              animate={selectedAvatar === avatar.id ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {avatar.emoji}
            </motion.div>

            {/* Avatar Name */}
            <p className={`text-sm font-medium ${
              selectedAvatar === avatar.id ? 'text-white' : 'text-white/80'
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
          className="text-center glass-dark rounded-2xl p-6 shadow-lg border border-metaverse-purple/30"
        >
          <p className="text-lg text-white/60 mb-2">คุณเลือก:</p>
          <div className="flex items-center justify-center gap-3">
            <motion.span 
              className="text-6xl filter drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {selectedAvatarDetails.emoji}
            </motion.span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-metaverse-purple to-metaverse-red">
              {selectedAvatarDetails.name}
            </span>
          </div>
          
          {/* Sparkle effects */}
          <div className="flex justify-center gap-2 mt-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-metaverse-purple rounded-full"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}