// components/avatar/EnhancedAvatarDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import { useAvatarData } from '@/hooks/useAvatarData';
import { UserAvatarData, AccessoryType } from '@/types/avatar';
import { 
  getAccessoryPosition,
  getAccessoryConfig
} from '@/lib/avatar/positioning';
import { Crown, Sparkles } from 'lucide-react';
import { basicAvatars } from '@/lib/data/avatars';
import { useEffect, useState } from 'react';
import { TITLE_BADGES } from '@/lib/data/items';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface EnhancedAvatarDisplayProps {
  userId: string;
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
  debug?: boolean;
}

// Cache for title data
const titleCache = new Map<string, { name: string; color: string }>();

export default function EnhancedAvatarDisplay({
  userId,
  avatarData,
  basicAvatar,
  size = 'medium',
  showAccessories = true,
  showEffects = true,
  showTitle = false,
  titleBadge,
  titleColor = '#FFD700',
  className = '',
  onClick,
  debug = false
}: EnhancedAvatarDisplayProps) {
  // Load avatar and accessory URLs
  const { avatarUrl, accessoryUrls, loading } = useAvatarData(userId, avatarData, basicAvatar);
  
  // State for title badge data
  const [titleData, setTitleData] = useState<{ name: string; color: string } | null>(null);
  
  // Load title badge data
  useEffect(() => {
    const loadTitleData = async () => {
      if (!titleBadge || !showTitle) {
        setTitleData(null);
        return;
      }
      
      // Check cache first
      if (titleCache.has(titleBadge)) {
        setTitleData(titleCache.get(titleBadge)!);
        return;
      }
      
      // Try local data first
      const localData = TITLE_BADGES[titleBadge];
      if (localData) {
        const data = {
          name: localData.name,
          color: localData.color || '#FFD700'
        };
        titleCache.set(titleBadge, data);
        setTitleData(data);
        return;
      }
      
      // Try Firebase
      try {
        const rewardsQuery = query(
          collection(db, 'rewards'),
          where('itemId', '==', titleBadge),
          where('type', '==', 'titleBadge'),
          limit(1)
        );
        
        const snapshot = await getDocs(rewardsQuery);
        
        if (!snapshot.empty) {
          const rewardData = snapshot.docs[0].data();
          const data = {
            name: rewardData.name || titleBadge,
            color: rewardData.color || '#FFD700'
          };
          titleCache.set(titleBadge, data);
          setTitleData(data);
          return;
        }
      } catch (error) {
        console.error('Error loading title badge:', error);
      }
      
      // Use default
      const defaultData = {
        name: titleBadge.replace(/title-/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: titleColor || '#FFD700'
      };
      titleCache.set(titleBadge, defaultData);
      setTitleData(defaultData);
    };
    
    loadTitleData();
  }, [titleBadge, showTitle, titleColor]);
  
  // Helper function to check if color is gradient
  const isGradient = (color: string) => {
    return color.includes('linear-gradient') || color.includes('radial-gradient');
  };
  
  // ✅ Safe access to avatarData with fallbacks
  const currentAvatar = avatarData?.currentAvatar;
  const isBasicAvatar = !currentAvatar || currentAvatar.type === 'basic' || !avatarUrl;
  
  // ✅ Get avatar ID with multiple fallbacks
  const avatarId = currentAvatar?.id || basicAvatar || 'knight';
  
  // Get emoji for basic avatar
  const getAvatarEmoji = (id: string): string => {
    const avatar = basicAvatars.find(a => a.id === id);
    return avatar?.emoji || '👤';
  };
  
  // Size mapping - แต่ใช้ admin page structure เสมอ
  const getSizeMultiplier = () => {
    switch (size) {
      case 'tiny': return 0.33;   // 100x100 - สำหรับ header
      case 'small': return 0.5;   // 150x150
      case 'medium': return 0.67; // 200x200  
      case 'large': return 0.83;  // 250x250
      case 'xlarge': return 1;    // 300x300 (เหมือน admin page)
      default: return 0.67;
    }
  };
  
  const sizeMultiplier = getSizeMultiplier();
  const finalSize = 300 * sizeMultiplier;
  
  return (
    <div 
      className={`relative inline-block ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Debug info - เพิ่มข้อมูลเปรียบเทียบ */}
      {debug && (
        <div className="absolute -top-20 left-0 bg-black/90 text-white text-xs p-3 rounded z-50 w-80">
          <div className="font-bold text-yellow-400 mb-2">🔍 Debug Info (Admin Style)</div>
          <div>Final Size: {finalSize}x{finalSize}</div>
          <div>Multiplier: {sizeMultiplier}</div>
          <div>Avatar: {avatarId} ({isBasicAvatar ? 'basic' : 'premium'})</div>
          <div>Accessories: {Object.keys(accessoryUrls).length}</div>
          <div>AvatarData: {avatarData ? 'exists' : 'undefined'}</div>
          <div>CurrentAvatar: {currentAvatar ? 'exists' : 'undefined'}</div>
          <div className="mt-2 text-green-300">
            <div className="font-semibold">Container: 300x300 (fixed)</div>
            <div>ใช้โครงสร้างเดียวกับ admin page 100%</div>
          </div>
        </div>
      )}
      
      {/* Title Badge */}
      {showTitle && titleData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10"
        >
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            style={isGradient(titleData.color) ? {
              backgroundColor: `rgba(255, 255, 255, 0.1)`,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            } : {
              backgroundColor: `${titleData.color}20`,
              color: titleData.color,
              border: `1px solid ${titleData.color}50`
            }}
          >
            <Crown className="w-3 h-3" style={{ color: isGradient(titleData.color) ? '#FFD700' : titleData.color }} />
            <span
              style={isGradient(titleData.color) ? {
                background: titleData.color,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              } : {
                color: titleData.color
              }}
            >
              {titleData.name}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Main Container - ขนาดตาม size prop แต่ใช้โครงสร้างเหมือน admin page */}
      <div 
        className={`relative ${debug ? 'border-2 border-red-500' : ''}`} 
        style={{ 
          width: `${finalSize}px`, 
          height: `${finalSize}px` 
        }}
      >
        {/* Center guides for debug */}
        {debug && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/20"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/20"></div>
          </div>
        )}
        
        {/* Admin Page Style Container - แก้ไข scale เมื่อ xlarge */}
        <div 
          className={`relative ${debug ? 'border-2 border-blue-500' : ''}`}
          style={ size === 'xlarge' ? {
            // xlarge: ไม่ scale เลย เหมือน admin page
            width: '300px',
            height: '300px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: '-150px',
            marginTop: '-150px'
          } : size === 'tiny' ? {
            // tiny: ใช้ scale และปรับ avatar ให้เล็กมาก
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
          } : {
            // size อื่นๆ: ใช้ scale
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
          {/* Center guides for inner container */}
          {debug && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500"></div>
            </div>
          )}
          
          {/* Avatar - ใช้โครงสร้างเดียวกับ admin page */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {isBasicAvatar ? (
                <div className="text-[120px] select-none">
                  {getAvatarEmoji(avatarId)}
                </div>
              ) : (
                <div className="w-48 h-48 relative overflow-hidden rounded-full">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('Failed to load avatar:', avatarUrl);
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
              
              {/* Accessories - ใช้วิธีเดียวกับ admin page 100% */}
              {/* ✅ เช็คให้แน่ใจว่ามี currentAvatar และ accessories ก่อนแสดง */}
              {showAccessories && currentAvatar?.accessories && Object.entries(accessoryUrls).map(([type, url]) => {
                const accessoryType = type as AccessoryType;
                const position = getAccessoryPosition(accessoryType, avatarId);
                const config = getAccessoryConfig(accessoryType);
                
                if (!url || !position) return null;
                
                // คำนวณ zIndex ครั้งเดียว
                const zIndexValue = accessoryType === AccessoryType.BACKGROUND ? -1 : 10;
                
                // ใช้ logic เดียวกับ admin page
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
                        className={`absolute pointer-events-none ${debug ? 'border border-yellow-500' : ''}`}
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
                        className={`absolute pointer-events-none ${debug ? 'border border-yellow-500' : ''}`}
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
                      
                      {/* Debug info for earrings */}
                      {debug && (
                        <div 
                          className="absolute bg-yellow-500/90 text-black text-[10px] p-1 rounded pointer-events-none z-50 font-mono"
                          style={{
                            left: left,
                            top: top,
                            transform: `${transform} translateY(-70px)`,
                          }}
                        >
                          <div className="font-bold">{type} (both ears)</div>
                          <div>Pos: {left}, {top}</div>
                          <div>XY: ±{Math.abs(position.x || 35)}, {position.y || 0}</div>
                          <div>Scale: {position.scale || 1}</div>
                          <div>Anchor: {config.anchorPoint}</div>
                          <div className="text-red-600 font-bold">ID: {avatarId}</div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Regular accessories
                return (
                  <div key={type}>
                    <div 
                      className={`absolute pointer-events-none ${debug ? 'border border-yellow-500' : ''}`}
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
                    
                    {/* Debug info */}
                    {debug && (
                      <div 
                        className="absolute bg-yellow-500/90 text-black text-[10px] p-1 rounded pointer-events-none z-50 font-mono"
                        style={{
                          left: left,
                          top: top,
                          transform: `${transform} translateY(-70px)`,
                        }}
                      >
                        <div className="font-bold">{type}</div>
                        <div>Pos: {left}, {top}</div>
                        <div>XY: {position.x || 0}, {position.y || 0}</div>
                        <div>Scale: {position.scale || 1}</div>
                        <div>Anchor: {config.anchorPoint}</div>
                        <div className="text-red-600 font-bold">ID: {avatarId}</div>
                      </div>
                    )}
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