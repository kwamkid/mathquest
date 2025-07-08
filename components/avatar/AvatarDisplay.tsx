// components/avatar/AvatarDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UserAvatarData } from '@/types/avatar';
import { Crown, Sparkles } from 'lucide-react';

interface AvatarDisplayProps {
  avatarData?: UserAvatarData;
  basicAvatar?: string;  // emoji avatar for backward compatibility
  premiumAvatarUrl?: string; // URL for premium avatar
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showEffects?: boolean;
  className?: string;
  showTitle?: boolean;
  titleBadge?: string;
  titleColor?: string;
}

export default function AvatarDisplay({
  avatarData,
  basicAvatar,
  premiumAvatarUrl,
  size = 'medium',
  showEffects = true,
  className = '',
  showTitle = false,
  titleBadge,
  titleColor = '#FFD700'
}: AvatarDisplayProps) {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { container: 'w-12 h-12', emoji: 'text-2xl', svg: 'w-12 h-12' },
    medium: { container: 'w-20 h-20', emoji: 'text-4xl', svg: 'w-20 h-20' },
    large: { container: 'w-32 h-32', emoji: 'text-6xl', svg: 'w-32 h-32' },
    xlarge: { container: 'w-48 h-48', emoji: 'text-8xl', svg: 'w-48 h-48' }
  };

  const config = sizeConfig[size];

  // Get emoji from basic avatar ID
  const getAvatarEmoji = (avatarId: string): string => {
    const avatarMap: Record<string, string> = {
      'knight': '🤴', 'warrior': '🦸‍♂️', 'warrioress': '🦸‍♀️', 'ninja': '🥷',
      'wizard': '🧙‍♂️', 'witch': '🧙‍♀️', 'superhero': '🦹‍♂️', 'superheroine': '🦹‍♀️',
      'vampire': '🧛‍♂️', 'vampiress': '🧛‍♀️', 'dragon': '🐉', 'unicorn': '🦄',
      'fox': '🦊', 'lion': '🦁', 'tiger': '🐯', 'wolf': '🐺', 'bear': '🐻',
      'panda': '🐼', 'monkey': '🐵', 'owl': '🦉', 'fairy': '🧚‍♀️', 'fairy-man': '🧚‍♂️',
      'mage': '🧙', 'genie': '🧞', 'mermaid': '🧜‍♀️', 'merman': '🧜‍♂️',
      'robot': '🤖', 'alien': '👽', 'ghost': '👻', 'zombie': '🧟'
    };
    return avatarMap[avatarId] || '👤';
  };

  // Reset error state when URL changes
  useEffect(() => {
    setImageError(false);
  }, [premiumAvatarUrl]);

  // Render basic emoji avatar
  const renderBasicAvatar = () => {
    const avatarId = avatarData?.currentAvatar.id || basicAvatar || 'knight';
    const emoji = getAvatarEmoji(avatarId);
    
    return (
      <motion.div
        className={`${config.emoji} select-none`}
        animate={showEffects ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {emoji}
      </motion.div>
    );
  };

  // Render premium avatar
  const renderPremiumAvatar = () => {
    if (imageError || !premiumAvatarUrl) {
      // Fallback to emoji if image fails
      return renderBasicAvatar();
    }

    return (
      <div className={`relative ${config.svg} overflow-hidden rounded-full`}>
        <img 
          src={premiumAvatarUrl} 
          alt="Premium Avatar"
          className="w-full h-full object-contain"
          onError={() => {
            console.error('Failed to load premium avatar:', premiumAvatarUrl);
            setImageError(true);
          }}
        />
        
        {/* Special effect for premium avatars */}
        {showEffects && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-t from-yellow-400/20 to-transparent" />
          </motion.div>
        )}
      </div>
    );
  };

  // Determine which avatar type to render
  const isBasicAvatar = !avatarData || avatarData.currentAvatar.type === 'basic' || !premiumAvatarUrl;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Title Badge */}
      {showTitle && titleBadge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10"
        >
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            style={{
              backgroundColor: `${titleColor}20`,
              color: titleColor,
              border: `1px solid ${titleColor}50`
            }}
          >
            <Crown className="w-3 h-3" />
            {titleBadge}
          </div>
        </motion.div>
      )}
      
      {/* Avatar Container */}
      <div className={`relative ${config.container} flex items-center justify-center`}>
        {/* Glow Effect */}
        {showEffects && (
          <>
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(147, 51, 234, 0.3)',
                  '0 0 40px rgba(147, 51, 234, 0.5)',
                  '0 0 20px rgba(147, 51, 234, 0.3)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            
            {/* Sparkles */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </>
        )}
        
        {/* Avatar */}
        {isBasicAvatar ? renderBasicAvatar() : renderPremiumAvatar()}
      </div>
      
      {/* Rarity Indicator */}
      {avatarData && !isBasicAvatar && (
        <div className="absolute -bottom-1 -right-1">
          <RarityBadge rarity="epic" size={size} />
        </div>
      )}
    </div>
  );
}

// Rarity Badge Component
interface RarityBadgeProps {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  size: 'small' | 'medium' | 'large' | 'xlarge';
}

function RarityBadge({ rarity, size }: RarityBadgeProps) {
  const colors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500'
  };
  
  const sizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-6 h-6',
    xlarge: 'w-8 h-8'
  };
  
  return (
    <motion.div
      className={`${sizes[size]} ${colors[rarity]} rounded-full shadow-lg`}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
  );
}