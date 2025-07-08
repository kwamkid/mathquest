// lib/data/items.ts

import { PremiumAvatar, AvatarAccessory, TitleBadge, Badge, AccessoryType } from '@/types/avatar';

// Premium Avatars Database
export const PREMIUM_AVATARS: Record<string, Omit<PremiumAvatar, 'id'>> = {
  'avatar-cute-dragon-zodiac': {
    name: 'Cute Dragon Zodiac',
    description: 'มังกรน้อยน่ารักจากราศีมังกร',
    svgUrl: 'https://firebasestorage.googleapis.com/v0/b/mathquest-c7c32.firebasestorage.app/o/rewards%2F1751963746605_cute-dragon-sodiac.svg?alt=media&token=cbbdc54a-6f35-4f0d-86bd-715e73785172',
    price: 500,
    rarity: 'epic',
    category: 'special'
  },
  'avatar-cyber-warrior': {
    name: 'Cyber Warrior',
    description: 'นักรบไซเบอร์จากอนาคต',
    svgUrl: '/avatars/premium/cyber-warrior.svg',
    price: 1000,
    rarity: 'rare',
    category: 'warriors'
  },
  'avatar-dragon-knight': {
    name: 'Dragon Knight',
    description: 'อัศวินมังกรผู้กล้าหาญ',
    svgUrl: '/avatars/premium/dragon-knight.svg',
    price: 2000,
    rarity: 'epic',
    category: 'warriors'
  },
  'avatar-space-explorer': {
    name: 'Space Explorer',
    description: 'นักสำรวจอวกาศ',
    svgUrl: '/avatars/premium/space-explorer.svg',
    price: 1500,
    rarity: 'rare',
    category: 'special'
  },
  'avatar-mystic-mage': {
    name: 'Mystic Mage',
    description: 'จอมเวทย์ลึกลับ',
    svgUrl: '/avatars/premium/mystic-mage.svg',
    price: 2500,
    rarity: 'epic',
    category: 'mystical'
  },
  'avatar-shadow-ninja': {
    name: 'Shadow Ninja',
    description: 'นินจาแห่งเงามืด',
    svgUrl: '/avatars/premium/shadow-ninja.svg',
    price: 3000,
    rarity: 'legendary',
    category: 'warriors'
  },
  'avatar-phoenix-guardian': {
    name: 'Phoenix Guardian',
    description: 'ผู้พิทักษ์ฟีนิกซ์',
    svgUrl: '/avatars/premium/phoenix-guardian.svg',
    price: 5000,
    rarity: 'legendary',
    category: 'mystical'
  }
};

// Accessories Database
export const ACCESSORIES: Record<string, Omit<AvatarAccessory, 'id'>> = {
  'acc-hat-crown': {
    name: 'Golden Crown',
    description: 'มงกุฎทองคำสุดหรู',
    type: AccessoryType.HAT,
    svgUrl: '/accessories/hat-crown.svg',
    price: 800,
    rarity: 'epic'
  },
  'acc-hat-wizard': {
    name: 'Wizard Hat',
    description: 'หมวกพ่อมดสีม่วง',
    type: AccessoryType.HAT,
    svgUrl: '/accessories/hat-wizard.svg',
    price: 500,
    rarity: 'rare'
  },
  'acc-glasses-cool': {
    name: 'Cool Sunglasses',
    description: 'แว่นกันแดดสุดเท่',
    type: AccessoryType.GLASSES,
    svgUrl: '/accessories/glasses-cool.svg',
    price: 300,
    rarity: 'common'
  },
  'acc-glasses-smart': {
    name: 'Smart Glasses',
    description: 'แว่นตาอัจฉริยะ',
    type: AccessoryType.GLASSES,
    svgUrl: '/accessories/glasses-smart.svg',
    price: 600,
    rarity: 'rare'
  },
  'acc-mask-hero': {
    name: 'Hero Mask',
    description: 'หน้ากากซูเปอร์ฮีโร่',
    type: AccessoryType.MASK,
    svgUrl: '/accessories/mask-hero.svg',
    price: 400,
    rarity: 'rare'
  },
  'acc-necklace-gold': {
    name: 'Gold Chain',
    description: 'สร้อยคอทองคำ',
    type: AccessoryType.NECKLACE,
    svgUrl: '/accessories/necklace-gold.svg',
    price: 700,
    rarity: 'epic'
  }
};

// Title Badges Database
export const TITLE_BADGES: Record<string, Omit<TitleBadge, 'id'>> = {
  'title-math-master': {
    name: 'เซียนเลข',
    description: 'ผู้เชี่ยวชาญคณิตศาสตร์',
    rarity: 'epic',
    color: '#9333EA'
  },
  'title-speed-demon': {
    name: 'เร็วสายฟ้า',
    description: 'ทำโจทย์ได้รวดเร็ว',
    rarity: 'rare',
    color: '#3B82F6'
  },
  'title-perfect-scorer': {
    name: 'นักแม่นยำ',
    description: 'ทำคะแนนเต็มหลายครั้ง',
    rarity: 'epic',
    color: '#10B981'
  },
  'title-dedication-hero': {
    name: 'ผู้มุ่งมั่น',
    description: 'เล่นต่อเนื่องทุกวัน',
    rarity: 'rare',
    color: '#F59E0B'
  },
  'title-legend': {
    name: 'ตำนาน',
    description: 'ผู้ที่ทำสำเร็จทุกความท้าทาย',
    rarity: 'legendary',
    color: '#FFD700'
  },
  'title-champion': {
    name: 'แชมป์',
    description: 'อันดับ 1 ของระดับชั้น',
    rarity: 'legendary',
    color: '#FF6B6B'
  }
};

// Helper functions to get item data
export function getPremiumAvatarData(itemId: string): PremiumAvatar | null {
  const data = PREMIUM_AVATARS[itemId];
  if (!data) return null;
  
  return {
    id: itemId,
    ...data
  };
}

export function getAccessoryData(itemId: string): AvatarAccessory | null {
  const data = ACCESSORIES[itemId];
  if (!data) return null;
  
  return {
    id: itemId,
    ...data
  };
}

export function getTitleBadgeData(itemId: string): TitleBadge | null {
  const data = TITLE_BADGES[itemId];
  if (!data) return null;
  
  return {
    id: itemId,
    ...data
  };
}