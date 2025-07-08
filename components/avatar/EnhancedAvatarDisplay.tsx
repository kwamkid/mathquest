// components/avatar/EnhancedAvatarDisplay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarData } from '@/hooks/useAvatarData';
import { UserAvatarData, AccessoryType, AvatarSizeConfig } from '@/types/avatar';
import { 
  getAvatarContainerSize, 
  calculateAccessoryPosition, 
  getAccessoryAnimation,
  shouldExpandContainer,
  AVATAR_SIZE_CONFIG 
} from '@/lib/avatar/positioning';
import { Crown, Sparkles } from 'lucide-react';
import { basicAvatars } from '@/lib/data/avatars';

interface EnhancedAvatarDisplayProps {
  userId: string;
  avatarData?: UserAvatarData;
  basicAvatar?: string;
  size?: keyof AvatarSizeConfig;
  showAccessories?: boolean;
  showEffects?: boolean;
  showTitle?: boolean;
  titleBadge?: string;
  titleColor?: string;
  className?: string;
  onClick?: () => void;
  debug?: boolean; // Add debug prop
}

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
  debug = false // Default false
}: EnhancedAvatarDisplayProps) {
  // Load avatar and accessory URLs
  const { avatarUrl, accessoryUrls, loading } = useAvatarData(userId, avatarData, basicAvatar);
  
  // Determine if we're using basic or premium avatar
  const isBasicAvatar = !avatarData || avatarData.currentAvatar.type === 'basic' || !avatarUrl;
  const avatarId = avatarData?.currentAvatar.id || basicAvatar || 'knight';
  
  // Get emoji for basic avatar
  const getAvatarEmoji = (id: string): string => {
    const avatar = basicAvatars.find(a => a.id === id);
    return avatar?.emoji || '👤';
  };
  
  // Check if container should expand (e.g., for hat)
  const hasHat = showAccessories && avatarData?.currentAvatar.accessories.hat;
  const shouldExpand = showAccessories && shouldExpandContainer(avatarData?.currentAvatar.accessories || {});
  
  // Get container size
  const containerSize = getAvatarContainerSize(size, shouldExpand);
  
  // Get size classes
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
    xlarge: 'text-8xl'
  };
  
  // Container styles
  const containerStyle = {
    width: `${containerSize.width}px`,
    height: `${containerSize.height}px`,
    transition: 'all 0.3s ease-in-out'
  };
  
  // Avatar scale when wearing hat
  const avatarScale = hasHat ? 0.9 : 1;
  
  return (
    <div 
      className={`relative inline-block ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Debug info */}
      {debug && (
        <div className="absolute -top-20 left-0 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div>Container: {containerSize.width}x{containerSize.height}</div>
          <div>Has Hat: {hasHat ? 'Yes' : 'No'}</div>
          <div>Should Expand: {shouldExpand ? 'Yes' : 'No'}</div>
        </div>
      )}
      
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
      
      {/* Avatar Container with border for debug */}
      <div 
        className={`relative flex items-center justify-center ${debug ? 'border-2 border-red-500' : ''}`} 
        style={containerStyle}
      >
        {/* Center guides for debug */}
        {debug && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500"></div>
          </div>
        )}
        
        {/* Glow Effect */}
        {showEffects && (
          <>
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
        
        {/* Background Accessory Layer */}
        {showAccessories && accessoryUrls.background && (
          <AccessoryLayer
            type={AccessoryType.BACKGROUND}
            url={accessoryUrls.background}
            avatarId={avatarId}
            containerSize={containerSize}
            debug={debug}
          />
        )}
        
        {/* Avatar Layer */}
        <motion.div
          className={`relative z-10 ${debug ? 'border border-green-500' : ''}`}
          animate={showEffects ? {
            scale: [avatarScale, avatarScale * 1.05, avatarScale],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transform: `scale(${avatarScale})` }}
        >
          {isBasicAvatar ? (
            <div className={`${sizeClasses[size]} select-none`}>
              {getAvatarEmoji(avatarId)}
            </div>
          ) : (
            <div className={`relative overflow-hidden rounded-full`} style={{
              width: AVATAR_SIZE_CONFIG[size].base,
              height: AVATAR_SIZE_CONFIG[size].base
            }}>
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
        </motion.div>
        
        {/* Accessory Layers (in z-index order) */}
        {showAccessories && (
          <>
            {/* Necklace */}
            {accessoryUrls.necklace && (
              <AccessoryLayer
                type={AccessoryType.NECKLACE}
                url={accessoryUrls.necklace}
                avatarId={avatarId}
                containerSize={containerSize}
                debug={debug}
              />
            )}
            
            {/* Glasses */}
            {accessoryUrls.glasses && (
              <AccessoryLayer
                type={AccessoryType.GLASSES}
                url={accessoryUrls.glasses}
                avatarId={avatarId}
                containerSize={containerSize}
                debug={debug}
              />
            )}
            
            {/* Mask */}
            {accessoryUrls.mask && (
              <AccessoryLayer
                type={AccessoryType.MASK}
                url={accessoryUrls.mask}
                avatarId={avatarId}
                containerSize={containerSize}
                debug={debug}
              />
            )}
            
            {/* Hat */}
            {accessoryUrls.hat && (
              <AccessoryLayer
                type={AccessoryType.HAT}
                url={accessoryUrls.hat}
                avatarId={avatarId}
                containerSize={containerSize}
                debug={debug}
              />
            )}
            
            {/* Earrings */}
            {accessoryUrls.earring && (
              <>
                {/* Left earring */}
                <AccessoryLayer
                  type={AccessoryType.EARRING}
                  url={accessoryUrls.earring}
                  avatarId={avatarId}
                  containerSize={containerSize}
                  side="left"
                  debug={debug}
                />
                {/* Right earring */}
                <AccessoryLayer
                  type={AccessoryType.EARRING}
                  url={accessoryUrls.earring}
                  avatarId={avatarId}
                  containerSize={containerSize}
                  side="right"
                  debug={debug}
                />
              </>
            )}
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

// Accessory Layer Component
interface AccessoryLayerProps {
  type: AccessoryType;
  url: string;
  avatarId: string;
  containerSize: { width: number; height: number };
  side?: 'left' | 'right'; // For earrings
  debug?: boolean;
}

function AccessoryLayer({ type, url, avatarId, containerSize, side, debug }: AccessoryLayerProps) {
  const position = calculateAccessoryPosition(type, avatarId, containerSize);
  const animation = getAccessoryAnimation(type);
  
  // Adjust position for earrings
  if (type === AccessoryType.EARRING && side) {
    const baseTransform = position.transform;
    const xOffset = side === 'left' ? -25 : 25;
    position.transform = baseTransform.replace(
      'translateX(25px)',
      `translateX(${xOffset}px)`
    );
  }
  
  // Create animation keyframes
  const animationKeyframes: any = {};
  
  if (animation) {
    switch (animation.split(' ')[0]) {
      case 'float':
        animationKeyframes.y = [-5, 5, -5];
        break;
      case 'rotate':
        animationKeyframes.rotate = [0, 360];
        break;
      case 'pulse':
        animationKeyframes.scale = [1, 1.1, 1];
        break;
      case 'bounce':
        animationKeyframes.y = [0, -10, 0];
        break;
    }
  }
  
  return (
    <>
      <motion.div
        className={`absolute pointer-events-none ${debug ? 'border border-yellow-500' : ''}`}
        style={{
          left: position.left,
          top: position.top,
          transform: position.transform,
          transformOrigin: 'center center', // Add explicit transform origin
          zIndex: 20 + (type === AccessoryType.BACKGROUND ? -15 : 0)
        }}
        animate={animation ? animationKeyframes : {}}
        transition={animation ? {
          duration: parseFloat(animation.split(' ')[1]) || 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        <img 
          src={url} 
          alt={`${type} accessory`}
          className="w-full h-full object-contain"
          style={{
            maxWidth: `${containerSize.width * 0.8}px`,
            maxHeight: `${containerSize.height * 0.8}px`
          }}
          onError={(e) => {
            console.error(`Failed to load ${type}:`, url);
          }}
        />
      </motion.div>
      
      {/* Debug info for this accessory */}
      {debug && (
        <div 
          className="absolute bg-yellow-500/80 text-black text-[10px] p-1 rounded pointer-events-none"
          style={{
            left: position.left,
            top: position.top,
            transform: `${position.transform} translateY(-30px)`,
            zIndex: 100
          }}
        >
          {type}: {position.left}, {position.top}
        </div>
      )}
    </>
  );
}