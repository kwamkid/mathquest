// types/avatar.ts

// Avatar System Types
export interface BasicAvatar {
  id: string;
  emoji: string;
  name: string;
  category: 'warriors' | 'creatures' | 'mystical';
}

export interface PremiumAvatar {
  id: string;
  name: string;
  description?: string;
  svgUrl: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'warriors' | 'creatures' | 'mystical' | 'special';
  requiredLevel?: number;
}

export interface AvatarAccessory {
  id: string;
  name: string;
  description?: string;
  type: AccessoryType;
  svgUrl: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  compatibleWith?: string[]; // avatar IDs ที่ใช้ได้, ถ้าไม่มี = ใช้ได้กับทุกตัว
}

export enum AccessoryType {
  HAT = 'hat',
  GLASSES = 'glasses',
  MASK = 'mask',
  EARRING = 'earring',
  NECKLACE = 'necklace',
  BACKGROUND = 'background',
}

// User's Avatar Data
export interface UserAvatarData {
  currentAvatar: {
    type: 'basic' | 'premium';
    id: string;
    accessories: {
      hat?: string;
      glasses?: string;
      mask?: string;
      earring?: string;
      necklace?: string;
      background?: string;
    };
  };
  unlockedPremiumAvatars: string[];  // premium avatar IDs ที่ปลดล็อคแล้ว
  unlockedAccessories: string[];      // accessory IDs ที่มี
}

// Reward System Types
export enum RewardType {
  AVATAR = 'avatar',           // ตัวละครพิเศษ
  ACCESSORY = 'accessory',     // หมวก, แว่นตา, ฯลฯ
  TITLE_BADGE = 'titleBadge',  // ฉายา/คำนำหน้า
  BOOST = 'boost',            // Boost EXP
  PHYSICAL = 'physical',       // ของจริง
  BADGE = 'badge'             // เหรียญตรา
}

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  price: number;              // EXP cost
  imageUrl?: string;          // URL สำหรับแสดงผล
  imagePath?: string;         // Path ใน Storage
  
  // Digital rewards
  itemId?: string;            // ID ของ avatar/accessory/boost
  boostDuration?: number;     // สำหรับ boost (minutes)
  boostMultiplier?: number;   // 1.5x, 2x, etc.
  
  // Physical rewards
  stock?: number;
  category?: string;
  requiresShipping?: boolean;
  
  // Conditions
  requiredLevel?: number;
  requiredGrade?: string[];
  limitPerUser?: number;
  
  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Redemption (การแลกรางวัล)
export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  rewardType: RewardType;
  rewardName: string;
  rewardImageUrl?: string;  // เพิ่ม field นี้
  expCost: number;
  
  // Status
  status: RedemptionStatus;
  createdAt: string;
  updatedAt?: string;
  
  // Physical rewards
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  
  // Digital rewards
  itemId?: string;            // avatar/accessory ID ที่ได้รับ
  activatedAt?: string;       // สำหรับ boost
  expiresAt?: string;         // สำหรับ boost
  
  // Admin notes
  adminNotes?: string;
  cancelReason?: string;
}

export enum RedemptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

// User Inventory
export interface UserInventory {
  userId: string;
  avatars: string[];          // owned premium avatar IDs
  accessories: string[];      // owned accessory IDs
  titleBadges: string[];      // owned title badge IDs
  badges: string[];          // owned badge IDs
  activeBoosts: ActiveBoost[];
}

export interface ActiveBoost {
  id: string;
  redemptionId: string;
  multiplier: number;         // 1.5, 2, etc.
  activatedAt: string;
  expiresAt: string;
}

// Title Badge System
export interface TitleBadge {
  id: string;
  name: string;
  description: string;
  price?: number;             // ถ้าไม่มี = ได้จาก achievement
  requiredAchievement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color?: string;             // สีของ title เช่น '#FFD700' (ทอง)
}

// Badge System  
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requiredAchievement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}