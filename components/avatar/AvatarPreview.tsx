// components/avatar/AvatarPreview.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatarData, AvatarAccessory, PremiumAvatar } from '@/types/avatar';
import EnhancedAvatarDisplay from './EnhancedAvatarDisplay';
import { Star, Lock, Check } from 'lucide-react';

interface AvatarPreviewProps {
  currentAvatarData: UserAvatarData;
  onAvatarChange: (avatarId: string, type: 'basic' | 'premium') => void;
  onAccessoryChange: (type: string, accessoryId: string | null) => void;
  availableAvatars: {
    basic: Array<{ id: string; emoji: string; name: string }>;
    premium: PremiumAvatar[];
  };
  availableAccessories: AvatarAccessory[];
  userExp: number;
}

export default function AvatarPreview({
  currentAvatarData,
  onAvatarChange,
  onAccessoryChange,
  availableAvatars,
  availableAccessories,
  userExp
}: AvatarPreviewProps) {
  const isOwned = (itemId: string, type: 'avatar' | 'accessory') => {
    if (type === 'avatar') {
      return currentAvatarData.unlockedPremiumAvatars.includes(itemId);
    }
    return currentAvatarData.unlockedAccessories.includes(itemId);
  };

  // Group accessories by type
  const accessoriesByType = availableAccessories.reduce((acc, accessory) => {
    if (!acc[accessory.type]) {
      acc[accessory.type] = [];
    }
    acc[accessory.type].push(accessory);
    return acc;
  }, {} as Record<string, AvatarAccessory[]>);

  // Create a temporary user ID for preview (won't actually load from DB)
  const tempUserId = 'preview-user';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview Section */}
      <div className="glass-dark rounded-3xl p-8 border border-metaverse-purple/30">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">ตัวอย่าง</h3>
        
        {/* Large Avatar Preview with Accessories */}
        <div className="flex justify-center mb-8">
          <motion.div
            key={JSON.stringify(currentAvatarData)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <EnhancedAvatarDisplay
              userId={tempUserId}
              avatarData={currentAvatarData}
              basicAvatar={
                currentAvatarData.currentAvatar.type === 'basic' 
                  ? currentAvatarData.currentAvatar.id 
                  : undefined
              }
              size="xlarge"
              showEffects={true}
              showAccessories={true}
            />
          </motion.div>
        </div>
        
        {/* Current Setup Info */}
        <div className="space-y-3 text-white/80">
          <div className="flex justify-between">
            <span>Avatar:</span>
            <span className="font-medium text-white">
              {currentAvatarData.currentAvatar.type === 'basic' 
                ? availableAvatars.basic.find(a => a.id === currentAvatarData.currentAvatar.id)?.name || 'Basic'
                : availableAvatars.premium.find(a => a.id === currentAvatarData.currentAvatar.id)?.name || 'Premium'
              }
            </span>
          </div>
          
          {Object.entries(currentAvatarData.currentAvatar.accessories).map(([type, id]) => (
            id && (
              <div key={type} className="flex justify-between">
                <span className="capitalize">{type}:</span>
                <span className="font-medium text-white">
                  {availableAccessories.find(a => a.id === id)?.name || id}
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Customization Section */}
      <div className="space-y-6">
        {/* Avatar Selection */}
        <div className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30">
          <h4 className="text-xl font-bold text-white mb-4">เลือก Avatar</h4>
          
          {/* Basic Avatars */}
          <div className="mb-4">
            <p className="text-sm text-white/60 mb-2">Basic (ฟรี)</p>
            <div className="grid grid-cols-6 gap-2">
              {availableAvatars.basic.map(avatar => (
                <motion.button
                  key={avatar.id}
                  onClick={() => onAvatarChange(avatar.id, 'basic')}
                  className={`p-3 rounded-xl transition-all ${
                    currentAvatarData.currentAvatar.id === avatar.id && currentAvatarData.currentAvatar.type === 'basic'
                      ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink'
                      : 'glass hover:bg-white/10'
                  } border ${
                    currentAvatarData.currentAvatar.id === avatar.id && currentAvatarData.currentAvatar.type === 'basic'
                      ? 'border-white/30'
                      : 'border-metaverse-purple/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl">{avatar.emoji}</div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Premium Avatars */}
          <div>
            <p className="text-sm text-white/60 mb-2">Premium</p>
            <div className="grid grid-cols-4 gap-3">
              {availableAvatars.premium.map(avatar => {
                const owned = isOwned(avatar.id, 'avatar');
                const canAfford = userExp >= avatar.price;
                
                return (
                  <motion.button
                    key={avatar.id}
                    onClick={() => owned && onAvatarChange(avatar.id, 'premium')}
                    disabled={!owned}
                    className={`relative p-4 rounded-xl transition-all ${
                      currentAvatarData.currentAvatar.id === avatar.id && currentAvatarData.currentAvatar.type === 'premium'
                        ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink'
                        : owned
                          ? 'glass hover:bg-white/10'
                          : 'glass opacity-50 cursor-not-allowed'
                    } border ${
                      currentAvatarData.currentAvatar.id === avatar.id && currentAvatarData.currentAvatar.type === 'premium'
                        ? 'border-white/30'
                        : 'border-metaverse-purple/30'
                    }`}
                    whileHover={owned ? { scale: 1.05 } : {}}
                    whileTap={owned ? { scale: 0.95 } : {}}
                  >
                    {/* Avatar Image */}
                    <div className="w-12 h-12 mb-1 relative overflow-hidden rounded-full bg-metaverse-purple/20">
                      {avatar.svgUrl ? (
                        <img 
                          src={avatar.svgUrl} 
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🦸</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🦸</div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <p className="text-xs text-white/80 truncate">{avatar.name}</p>
                    
                    {/* Status Indicators */}
                    {owned ? (
                      currentAvatarData.currentAvatar.id === avatar.id && currentAvatarData.currentAvatar.type === 'premium' && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )
                    ) : (
                      <div className="absolute top-1 right-1">
                        <Lock className={`w-4 h-4 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                      </div>
                    )}
                    
                    {/* Price */}
                    {!owned && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          {avatar.price} EXP
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accessories Selection */}
        {Object.entries(accessoriesByType).map(([type, accessories]) => (
          <div key={type} className="glass-dark rounded-2xl p-6 border border-metaverse-purple/30">
            <h4 className="text-xl font-bold text-white mb-4 capitalize">{type}</h4>
            
            <div className="grid grid-cols-4 gap-3">
              {/* Remove option */}
              <motion.button
                onClick={() => onAccessoryChange(type, null)}
                className={`p-4 rounded-xl transition-all glass hover:bg-white/10 border ${
                  !currentAvatarData.currentAvatar.accessories[type as keyof typeof currentAvatarData.currentAvatar.accessories]
                    ? 'border-white/30 bg-white/10'
                    : 'border-metaverse-purple/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">❌</div>
                  <p className="text-xs text-white/80">ไม่ใส่</p>
                </div>
              </motion.button>
              
              {/* Accessory options */}
              {accessories.map(accessory => {
                const owned = isOwned(accessory.id, 'accessory');
                const selected = currentAvatarData.currentAvatar.accessories[type as keyof typeof currentAvatarData.currentAvatar.accessories] === accessory.id;
                const canAfford = userExp >= accessory.price;
                
                return (
                  <motion.button
                    key={accessory.id}
                    onClick={() => owned && onAccessoryChange(type, accessory.id)}
                    disabled={!owned}
                    className={`relative p-4 rounded-xl transition-all ${
                      selected
                        ? 'bg-gradient-to-br from-metaverse-purple to-metaverse-pink'
                        : owned
                          ? 'glass hover:bg-white/10'
                          : 'glass opacity-50 cursor-not-allowed'
                    } border ${
                      selected
                        ? 'border-white/30'
                        : 'border-metaverse-purple/30'
                    }`}
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
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl">👑</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👑</div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <p className="text-xs text-white/80 truncate">{accessory.name}</p>
                    
                    {/* Rarity Stars */}
                    <div className="flex justify-center mt-1">
                      {Array.from({ length: getRarityStars(accessory.rarity) }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    
                    {/* Status */}
                    {owned ? (
                      selected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )
                    ) : (
                      <>
                        <div className="absolute top-1 right-1">
                          <Lock className={`w-4 h-4 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                        </div>
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className={`text-xs font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
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
      </div>
    </div>
  );
}

// Helper function
function getRarityStars(rarity: string): number {
  switch (rarity) {
    case 'common': return 1;
    case 'rare': return 2;
    case 'epic': return 3;
    case 'legendary': return 4;
    default: return 1;
  }
}