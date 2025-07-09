// components/admin/AdminAvatarDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserAvatarData, AccessoryType } from '@/types/avatar';
import { basicAvatars } from '@/lib/data/avatars';
import { 
  getAccessoryPosition,
  getAccessoryConfig
} from '@/lib/avatar/positioning';
import { Crown, Sparkles } from 'lucide-react';
import { getPremiumAvatarData, getAccessoryData } from '@/lib/data/items';
import { getReward } from '@/lib/firebase/rewards';

interface AdminAvatarDisplayProps {
  userId?: string;
  avatarData?: UserAvatarData;
  basicAvatar?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
  showAccessories?: boolean;
  showEffects?: boolean;
  showTitle?: boolean;
  titleBadge?: string;
  titleColor?: string;
  className?: string;
  onClick?: () => void;
}

// Cache for loaded URLs
const urlCache = new Map<string, string>();

export default function AdminAvatarDisplay({
  userId,
  avatarData,
  basicAvatar = 'knight',
  size = 'small',
  showAccessories = true,
  showEffects = false,
  showTitle = false,
  titleBadge,
  titleColor = '#FFD700',
  className = '',
  onClick
}: AdminAvatarDisplayProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [accessoryUrls, setAccessoryUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Get avatar emoji
  const getAvatarEmoji = (id: string): string => {
    const avatar = basicAvatars.find(a => a.id === id);
    return avatar?.emoji || '👤';
  };
  
  // Size mapping (same as EnhancedAvatarDisplay)
  const getSizeMultiplier = () => {
    switch (size) {
      case 'tiny': return 0.33;
      case 'small': return 0.5;
      case 'medium': return 0.67;
      case 'large': return 0.83;
      case 'xlarge': return 1;
      default: return 0.67;
    }
  };
  
  const sizeMultiplier = getSizeMultiplier();
  const finalSize = 300 * sizeMultiplier;
  
  // Determine avatar type and ID safely
  const isBasicAvatar = !avatarData?.currentAvatar || avatarData.currentAvatar.type === 'basic' || !avatarUrl;
  const avatarId = avatarData?.currentAvatar?.id || basicAvatar;
  
  // Load avatar URL
  const loadAvatarUrl = async (avatarId: string) => {
    // Check cache first
    if (urlCache.has(avatarId)) {
      return urlCache.get(avatarId) || null;
    }
    
    try {
      // Try local database first
      const localData = getPremiumAvatarData(avatarId);
      if (localData?.svgUrl) {
        urlCache.set(avatarId, localData.svgUrl);
        return localData.svgUrl;
      }
      
      // Try Firebase
      const rewardData = await getReward(avatarId);
      if (rewardData?.imageUrl) {
        urlCache.set(avatarId, rewardData.imageUrl);
        return rewardData.imageUrl;
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
    
    return null;
  };
  
  // Load accessory URL
  const loadAccessoryUrl = async (accessoryId: string) => {
    // Check cache first
    if (urlCache.has(accessoryId)) {
      return urlCache.get(accessoryId) || null;
    }
    
    try {
      // Try local database first
      const localData = getAccessoryData(accessoryId);
      if (localData?.svgUrl) {
        urlCache.set(accessoryId, localData.svgUrl);
        return localData.svgUrl;
      }
      
      // Try Firebase
      const rewardData = await getReward(accessoryId);
      if (rewardData?.imageUrl) {
        urlCache.set(accessoryId, rewardData.imageUrl);
        return rewardData.imageUrl;
      }
    } catch (error) {
      console.error('Error loading accessory:', error);
    }
    
    return null;
  };
  
  // Load all data
  useEffect(() => {
    const loadData = async () => {
      if (!avatarData?.currentAvatar) return;
      
      setLoading(true);
      
      try {
        // Load avatar if premium
        if (avatarData.currentAvatar.type === 'premium' && avatarData.currentAvatar.id) {
          const url = await loadAvatarUrl(avatarData.currentAvatar.id);
          if (url) setAvatarUrl(url);
        }
        
        // Load accessories
        if (showAccessories && avatarData.currentAvatar.accessories) {
          const urls: Record<string, string> = {};
          
          for (const [type, id] of Object.entries(avatarData.currentAvatar.accessories)) {
            if (id) {
              const url = await loadAccessoryUrl(id);
              if (url) urls[type] = url;
            }
          }
          
          setAccessoryUrls(urls);
        }
      } catch (error) {
        console.error('Error loading avatar data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [avatarData, showAccessories]);
  
  return (
    <div 
      className={`relative inline-block ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
            {titleBadge.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </motion.div>
      )}
      
      {/* Main Container */}
      <div 
        className="relative"
        style={{ 
          width: `${finalSize}px`, 
          height: `${finalSize}px` 
        }}
      >
        {/* Inner Container (same structure as EnhancedAvatarDisplay) */}
        <div 
          className="relative"
          style={ size === 'xlarge' ? {
            width: '300px',
            height: '300px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-150px',
            marginTop: '-150px'
          } : {
            width: '300px',
            height: '300px',
            transform: `scale(${sizeMultiplier})`,
            transformOrigin: 'center center',
            margin: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-150px',
            marginTop: '-150px'
          }}
        >
          {/* Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {isBasicAvatar ? (
                <div className="text-[120px] select-none">
                  {getAvatarEmoji(avatarId)}
                </div>
              ) : (
                <div className="w-48 h-48 relative overflow-hidden rounded-full">
                  <img 
                    src={avatarUrl!} 
                    alt="Avatar"
                    className="w-full h-full object-contain"
                    onError={() => {
                      console.error('Failed to load avatar:', avatarUrl);
                      setAvatarUrl(null); // Fallback to emoji
                    }}
                  />
                  
                  {/* Premium avatar glow */}
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
              )}
              
              {/* Accessories */}
              {showAccessories && Object.entries(accessoryUrls).map(([type, url]) => {
                const accessoryType = type as AccessoryType;
                const position = getAccessoryPosition(accessoryType, avatarId);
                const config = getAccessoryConfig(accessoryType);
                
                if (!url || !position) return null;
                
                const zIndexValue = accessoryType === AccessoryType.BACKGROUND ? -1 : 10;
                
                let left = '50%';
                let top = '50%';
                
                if (config.anchorPoint) {
                  if (config.anchorPoint.includes('left')) {
                    left = '0%';
                  } else if (config.anchorPoint.includes('right')) {
                    left = '100%';
                  }
                  
                  if (config.anchorPoint.includes('top')) {
                    top = '0%';
                  } else if (config.anchorPoint.includes('bottom')) {
                    top = '100%';
                  }
                }
                
                const transform = `
                  translate(-50%, -50%)
                  translateX(${position.x || 0}px)
                  translateY(${position.y || 0}px)
                  scale(${position.scale || 1})
                  rotate(${position.rotation || 0}deg)
                `;
                
                // Special handling for earrings
                if (accessoryType === AccessoryType.EARRING) {
                  return (
                    <div key={type}>
                      {/* Left earring */}
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          left: left,
                          top: top,
                          transform: `
                            translate(-50%, -50%)
                            translateX(${-Math.abs(position.x || 35)}px)
                            translateY(${position.y || 0}px)
                            scale(${position.scale || 1})
                            rotate(${position.rotation || 0}deg)
                          `,
                          width: '150px',
                          height: '150px',
                          zIndex: zIndexValue
                        }}
                      >
                        <img 
                          src={url} 
                          alt={`${type} accessory`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Right earring */}
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          left: left,
                          top: top,
                          transform: `
                            translate(-50%, -50%)
                            translateX(${Math.abs(position.x || 35)}px)
                            translateY(${position.y || 0}px)
                            scale(${position.scale || 1})
                            rotate(${position.rotation || 0}deg)
                          `,
                          width: '150px',
                          height: '150px',
                          zIndex: zIndexValue
                        }}
                      >
                        <img 
                          src={url} 
                          alt={`${type} accessory`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  );
                }
                
                // Regular accessories
                return (
                  <div key={type}>
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        left: left,
                        top: top,
                        transform: transform,
                        width: '150px',
                        height: '150px',
                        zIndex: zIndexValue
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`${type} accessory`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error(`Failed to load ${type}:`, url);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Glow Effect */}
        {showEffects && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
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
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          </motion.div>
        </div>
      )}
    </div>
  );
}