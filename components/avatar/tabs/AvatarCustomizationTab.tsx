// components/avatar/tabs/AvatarCustomizationTab.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { UserAvatarData, AvatarAccessory, PremiumAvatar } from '@/types/avatar';
import EnhancedAvatarDisplay from '../EnhancedAvatarDisplay';
import { basicAvatars } from '@/lib/data/avatars';
import { User, Sparkles, CheckCircle, Lock, Star, X } from 'lucide-react';

interface AvatarCustomizationTabProps {
  avatarData: UserAvatarData;
  premiumAvatars: PremiumAvatar[];
  accessories: AvatarAccessory[];
  userExp: number;
  onAvatarChange: (avatarId: string, type: 'basic' | 'premium') => void;
  onAccessoryChange: (type: string, accessoryId: string | null) => void;
}

export default function AvatarCustomizationTab({
  avatarData,
  premiumAvatars,
  accessories,
  userExp,
  onAvatarChange,
  onAccessoryChange
}: AvatarCustomizationTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'avatars' | 'accessories'>('avatars');

  const isOwned = (itemId: string, type: 'avatar' | 'accessory') => {
    if (type === 'avatar') {
      return avatarData.unlockedPremiumAvatars.includes(itemId);
    }
    return avatarData.unlockedAccessories.includes(itemId);
  };

  // Group accessories by type
  const accessoriesByType = accessories.reduce((acc, accessory) => {
    if (!acc[accessory.type]) {
      acc[accessory.type] = [];
    }
    acc[accessory.type].push(accessory);
    return acc;
  }, {} as Record<string, AvatarAccessory[]>);

  const getRarityStars = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'rare': return 2;
      case 'epic': return 3;
      case 'legendary': return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar Preview Card - Fixed Height */}
      <div className="glass-dark rounded-2xl p-4 md:p-6 border border-metaverse-purple/30">
        <h3 className="text-center text-lg md:text-xl font-bold text-white mb-4">ตัวอย่าง Avatar</h3>
        
        {/* Avatar Display Container - Fixed Size */}
        <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-metaverse-purple/20 rounded-full blur-3xl" />
          
          {/* Avatar */}
          <motion.div
            key={JSON.stringify(avatarData)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative z-10"
          >
            <EnhancedAvatarDisplay
              userId="preview-user"
              avatarData={avatarData}
              basicAvatar={
                avatarData.currentAvatar.type === 'basic' 
                  ? avatarData.currentAvatar.id 
                  : undefined
              }
              size="large"
              showEffects={true}
              showAccessories={true}
            />
          </motion.div>
        </div>
        
        {/* Current Setup Info */}
        <div className="mt-4 p-3 glass rounded-lg space-y-1.5 text-xs md:text-sm">
          <div className="flex justify-between text-white/70">
            <span>Avatar:</span>
            <span className="font-medium text-white truncate ml-2">
              {avatarData.currentAvatar.type === 'basic' 
                ? basicAvatars.find(a => a.id === avatarData.currentAvatar.id)?.name || 'Basic'
                : premiumAvatars.find(a => a.id === avatarData.currentAvatar.id)?.name || 'Premium'
              }
            </span>
          </div>
          
          {Object.entries(avatarData.currentAvatar.accessories).map(([type, id]) => (
            id && (
              <div key={type} className="flex justify-between text-white/70">
                <span className="capitalize">{type}:</span>
                <span className="font-medium text-white truncate ml-2">
                  {accessories.find(a => a.id === id)?.name || '-'}
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="glass-dark rounded-xl p-1 border border-metaverse-purple/30">
        <div className="flex">
          <button
            onClick={() => setActiveSubTab('avatars')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
              activeSubTab === 'avatars'
                ? 'metaverse-button text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Avatars
          </button>
          <button
            onClick={() => setActiveSubTab('accessories')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm ${
              activeSubTab === 'accessories'
                ? 'metaverse-button text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Accessories
          </button>
        </div>
      </div>

      {/* Content Area - No scroll container */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'avatars' ? (
          <motion.div
            key="avatars"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Basic Avatars */}
            <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Basic Avatars (ฟรี)
              </h4>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {basicAvatars.map(avatar => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => onAvatarChange(avatar.id, 'basic')}
                    className={`p-3 rounded-xl transition-all ${
                      avatarData.currentAvatar.id === avatar.id && avatarData.currentAvatar.type === 'basic'
                        ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink border-white/30'
                        : 'glass hover:bg-white/10 border-metaverse-purple/30'
                    } border`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl sm:text-3xl">{avatar.emoji}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Premium Avatars */}
            <div className="glass-dark rounded-xl p-4 border border-metaverse-purple/30">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Premium Avatars
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {premiumAvatars.map(avatar => {
                  const owned = isOwned(avatar.id, 'avatar');
                  const canAfford = userExp >= avatar.price;
                  
                  return (
                    <motion.button
                      key={avatar.id}
                      onClick={() => owned && onAvatarChange(avatar.id, 'premium')}
                      disabled={!owned}
                      className={`relative p-4 rounded-xl transition-all ${
                        avatarData.currentAvatar.id === avatar.id && avatarData.currentAvatar.type === 'premium'
                          ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink border-white/30'
                          : owned
                            ? 'glass hover:bg-white/10 border-metaverse-purple/30'
                            : 'glass opacity-50 cursor-not-allowed border-metaverse-purple/20'
                      } border`}
                      whileHover={owned ? { scale: 1.05 } : {}}
                      whileTap={owned ? { scale: 0.95 } : {}}
                    >
                      {/* Avatar Image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mb-2 relative overflow-hidden rounded-full bg-metaverse-purple/20 mx-auto">
                        {avatar.svgUrl ? (
                          <img 
                            src={avatar.svgUrl} 
                            alt={avatar.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl">🦸</div>
                        )}
                      </div>
                      
                      {/* Name */}
                      <p className="text-xs text-white/80 truncate mb-1">{avatar.name}</p>
                      
                      {/* Rarity */}
                      <div className="flex justify-center gap-0.5">
                        {Array.from({ length: getRarityStars(avatar.rarity) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      
                      {/* Status */}
                      {owned ? (
                        avatarData.currentAvatar.id === avatar.id && avatarData.currentAvatar.type === 'premium' && (
                          <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )
                      ) : (
                        <>
                          <div className="absolute top-2 right-2">
                            <Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                              {avatar.price} EXP
                            </div>
                          </div>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="accessories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Accessories by Type */}
            {Object.entries(accessoriesByType).map(([type, items]) => (
              <div key={type} className="glass-dark rounded-xl p-4 border border-metaverse-purple/30">
                <h4 className="text-lg font-bold text-white mb-3 capitalize">{type}</h4>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {/* Remove option */}
                  <motion.button
                    onClick={() => onAccessoryChange(type, null)}
                    className={`p-3 rounded-xl transition-all glass hover:bg-white/10 border ${
                      !avatarData.currentAvatar.accessories[type as keyof typeof avatarData.currentAvatar.accessories]
                        ? 'border-white/30 bg-white/10'
                        : 'border-metaverse-purple/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">
                        <X className="w-6 h-6 mx-auto text-red-400" />
                      </div>
                      <p className="text-[10px] text-white/70">ไม่ใส่</p>
                    </div>
                  </motion.button>
                  
                  {/* Accessory options */}
                  {items.map(accessory => {
                    const owned = isOwned(accessory.id, 'accessory');
                    const selected = avatarData.currentAvatar.accessories[type as keyof typeof avatarData.currentAvatar.accessories] === accessory.id;
                    const canAfford = userExp >= accessory.price;
                    
                    return (
                      <motion.button
                        key={accessory.id}
                        onClick={() => owned && onAccessoryChange(type, accessory.id)}
                        disabled={!owned}
                        className={`relative p-3 rounded-xl transition-all ${
                          selected
                            ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink border-white/30'
                            : owned
                              ? 'glass hover:bg-white/10 border-metaverse-purple/30'
                              : 'glass opacity-50 cursor-not-allowed border-metaverse-purple/20'
                        } border`}
                        whileHover={owned ? { scale: 1.05 } : {}}
                        whileTap={owned ? { scale: 0.95 } : {}}
                      >
                        {/* Accessory Image */}
                        <div className="w-10 h-10 mb-1 mx-auto relative overflow-hidden rounded-lg bg-metaverse-purple/20">
                          {accessory.svgUrl ? (
                            <img 
                              src={accessory.svgUrl} 
                              alt={accessory.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">👑</div>
                          )}
                        </div>
                        
                        {/* Name */}
                        <p className="text-[10px] text-white/70 truncate">{accessory.name}</p>
                        
                        {/* Status */}
                        {owned ? (
                          selected && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-2.5 h-2.5 text-white" />
                            </div>
                          )
                        ) : (
                          <>
                            <div className="absolute top-1 right-1">
                              <Lock className={`w-3 h-3 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                            </div>
                            <div className="absolute bottom-0.5 left-0.5 right-0.5">
                              <div className={`text-[10px] font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                {accessory.price}
                              </div>
                            </div>
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}