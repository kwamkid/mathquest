// lib/avatar/positioning.ts

import { 
  AccessoryType, 
  AccessoryConfig, 
  AvatarContainerConfig, 
  AvatarSizeConfig 
} from '@/types/avatar';

// Z-index layers for proper stacking order
export const ACCESSORY_LAYERS = {
  background: 0,
  avatar: 10,
  necklace: 20,
  glasses: 30,
  mask: 35,
  hat: 40,
  earring: 50,
  effects: 60
};

// Default positioning for each accessory type
export const ACCESSORY_POSITIONS: Record<AccessoryType, AccessoryConfig> = {
    
  [AccessoryType.HAT]: {
    zIndex: ACCESSORY_LAYERS.hat,
    defaultPosition: { 
      x: 0, 
      y: 0,  // วางเหนือหัว
      scale: 1.2 
    },
    anchorPoint: 'top-center',
    affectsContainerSize: true,
    animation: {
      type: 'float',
      duration: 3
    },
    // ตำแหน่งพิเศษสำหรับ avatar บางตัว
    positionOverrides: {
      'ninja': { x: 0, y: -25, scale: 1.1 },      // นินจาหัวเล็กกว่า
      'wizard': { x: 0, y: -35, scale: 1.3 },     // พ่อมดหมวกสูง
      'dragon': { x: 0, y: -40, scale: 1.4 },     // มังกรหัวใหญ่
      'unicorn': { x: 0, y: -35, scale: 1.25 }    // ยูนิคอร์นมีเขา
    }
  },
  
  [AccessoryType.GLASSES]: {
    zIndex: ACCESSORY_LAYERS.glasses,
    defaultPosition: { 
      x: 0, 
      y: 8,   // ระดับตา
      scale: 1.2
    },
    anchorPoint: 'center',
    affectsContainerSize: false,
    positionOverrides: {
      'owl': { x: 0, y: -8, scale: 1.3 },         // นกฮูกตาใหญ่
      'panda': { x: 0, y: -3, scale: 1.2 },      // แพนด้าตาต่ำกว่า
      'robot': { x: 0, y: -5, scale: 1.3 }        // หุ่นยนต์
    }
  },
  
  [AccessoryType.MASK]: {
    zIndex: ACCESSORY_LAYERS.mask,
    defaultPosition: { 
      x: 0, 
      y: 0,    // กลางหน้า
      scale: 1.0 
    },
    anchorPoint: 'center',
    affectsContainerSize: false,
    animation: {
      type: 'pulse',
      duration: 2
    },
    positionOverrides: {
      'superhero': { x: 0, y: -2, scale: 1.05 },
      'vampire': { x: 0, y: 2, scale: 0.95 }
    }
  },
  
  [AccessoryType.EARRING]: {
    zIndex: ACCESSORY_LAYERS.earring,
    defaultPosition: { 
      x: 25,   // ด้านข้างหู (อาจต้อง render 2 อัน)
      y: 0, 
      scale: 0.7 
    },
    anchorPoint: 'center',
    affectsContainerSize: false,
    animation: {
      type: 'rotate',
      duration: 4
    }
  },
  
  [AccessoryType.NECKLACE]: {
    zIndex: ACCESSORY_LAYERS.necklace,
    defaultPosition: { 
      x: 0, 
      y: 20,   // ใต้คอ
      scale: 0.8 
    },
    anchorPoint: 'top-center',
    affectsContainerSize: false,
    positionOverrides: {
      'vampire': { x: 0, y: 25, scale: 0.85 },    // แวมไพร์คอยาว
      'genie': { x: 0, y: 15, scale: 0.75 }       // ยักษ์จินนี่ตัวใหญ่
    }
  },
  
  [AccessoryType.BACKGROUND]: {
    zIndex: ACCESSORY_LAYERS.background,
    defaultPosition: { 
      x: 0, 
      y: 0, 
      scale: 1.5,  // background ใหญ่กว่า avatar
      opacity: 0.8 
    },
    anchorPoint: 'center',
    affectsContainerSize: false,
    animation: {
      type: 'pulse',
      duration: 5
    }
  }
};

// Container configuration
export const AVATAR_CONTAINER_CONFIG: AvatarContainerConfig = {
  baseAspectRatio: 1,        // 1:1 square by default
  withHatAspectRatio: 1.2,   // 1:1.2 when wearing hat
  maxHeightMultiplier: 1.3,  // max 30% taller
  scalingStrategy: 'expand-container' // ขยาย container เมื่อใส่หมวก
};

// Size configurations for different avatar sizes
export const AVATAR_SIZE_CONFIG: AvatarSizeConfig = {
  small: {
    base: 48,
    withHat: 56    // +8px for hat
  },
  medium: {
    base: 80,
    withHat: 96    // +16px for hat
  },
  large: {
    base: 128,
    withHat: 152   // +24px for hat
  },
  xlarge: {
    base: 192,
    withHat: 224   // +32px for hat
  }
};

// Helper functions
export function getAccessoryConfig(type: AccessoryType): AccessoryConfig {
  return ACCESSORY_POSITIONS[type];
}

export function getAvatarContainerSize(
  size: keyof AvatarSizeConfig,
  hasHat: boolean
): { width: number; height: number } {
  const config = AVATAR_SIZE_CONFIG[size];
  return {
    width: config.base,
    height: hasHat ? config.withHat : config.base
  };
}

export function getAccessoryPosition(
  type: AccessoryType,
  avatarId: string
): AccessoryConfig['defaultPosition'] {
  const config = ACCESSORY_POSITIONS[type];
  
  // Check for avatar-specific override
  if (config.positionOverrides && config.positionOverrides[avatarId]) {
    return {
      ...config.defaultPosition,
      ...config.positionOverrides[avatarId]
    };
  }
  
  return config.defaultPosition;
}

// Calculate actual pixel positions based on container size
export function calculateAccessoryPosition(
  accessoryType: AccessoryType,
  avatarId: string,
  containerSize: { width: number; height: number }
): {
  left: string;
  top: string;
  transform: string;
} {
  const position = getAccessoryPosition(accessoryType, avatarId);
  const config = getAccessoryConfig(accessoryType);
  
  // Default center position
  let left = '50%';
  let top = '50%';
  
  // Adjust based on anchor point
  switch (config.anchorPoint) {
    case 'top-left':
      left = '0%';
      top = '0%';
      break;
    case 'top-center':
      left = '50%';
      top = '0%';
      break;
    case 'top-right':
      left = '100%';
      top = '0%';
      break;
    case 'center-left':
      left = '0%';
      top = '50%';
      break;
    case 'center-right':
      left = '100%';
      top = '50%';
      break;
    case 'bottom-left':
      left = '0%';
      top = '100%';
      break;
    case 'bottom-center':
      left = '50%';
      top = '100%';
      break;
    case 'bottom-right':
      left = '100%';
      top = '100%';
      break;
  }
  
  // Build transform string
  const transforms = [
    `translate(-50%, -50%)`, // Center the element
    `translateX(${position.x || 0}px)`,
    `translateY(${position.y || 0}px)`,
    `scale(${position.scale || 1})`,
  ];
  
  if (position.rotation) {
    transforms.push(`rotate(${position.rotation}deg)`);
  }
  
  if (position.flipX) {
    transforms.push('scaleX(-1)');
  }
  
  if (position.flipY) {
    transforms.push('scaleY(-1)');
  }
  
  return {
    left,
    top,
    transform: transforms.join(' ')
  };
}

// Check if any accessories affect container size
export function shouldExpandContainer(accessories: Partial<Record<AccessoryType, string>>): boolean {
  return Object.keys(accessories).some(type => {
    const config = ACCESSORY_POSITIONS[type as AccessoryType];
    return config?.affectsContainerSize === true;
  });
}

// Get animation CSS for accessory
export function getAccessoryAnimation(type: AccessoryType): string | null {
  const config = ACCESSORY_POSITIONS[type];
  if (!config.animation || config.animation.type === 'none') {
    return null;
  }
  
  const { type: animType, duration = 3 } = config.animation;
  
  switch (animType) {
    case 'float':
      return `float ${duration}s ease-in-out infinite`;
    case 'rotate':
      return `rotate ${duration}s linear infinite`;
    case 'pulse':
      return `pulse ${duration}s ease-in-out infinite`;
    case 'bounce':
      return `bounce ${duration}s ease-in-out infinite`;
    default:
      return null;
  }
}