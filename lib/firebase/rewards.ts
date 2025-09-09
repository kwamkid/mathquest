// lib/firebase/rewards.ts
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  serverTimestamp,
  DocumentReference,
  Timestamp,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from './client';
import { 
  Reward, 
  RewardType, 
  Redemption, 
  RedemptionStatus,
  UserInventory,
  ActiveBoost,
  ShippingAddress,
  AccessoryType
} from '@/types/avatar';

// Collections
const COLLECTIONS = {
  REWARDS: 'rewards',
  REDEMPTIONS: 'redemptions',
  USER_INVENTORY: 'userInventory',
  USERS: 'users'
} as const;

// ==================== REWARD MANAGEMENT ====================

// Get all active rewards
export const getActiveRewards = async (
  filterType?: RewardType,
  userLevel?: number
): Promise<Reward[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.REWARDS),
      where('isActive', '==', true),
      orderBy('price', 'asc')
    );

    const snapshot = await getDocs(q);
    let rewards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reward));

    // Client-side filtering
    if (filterType) {
      rewards = rewards.filter(r => r.type === filterType);
    }

    if (userLevel) {
      rewards = rewards.filter(r => !r.requiredLevel || r.requiredLevel <= userLevel);
    }

    return rewards;
  } catch (error) {
    console.error('Error getting rewards:', error);
    throw new Error('ไม่สามารถโหลดรายการรางวัลได้');
  }
};

// Get single reward - FIXED to search by itemId field
export const getReward = async (itemId: string): Promise<Reward | null> => {
  try {
    // First try to get by document ID (backward compatibility)
    const docRef = doc(db, COLLECTIONS.REWARDS, itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Reward;
    }
    
    // If not found, query by itemId field
    const q = query(
      collection(db, COLLECTIONS.REWARDS),
      where('itemId', '==', itemId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Reward;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting reward:', error);
    return null;
  }
};

// ==================== PURCHASE & REDEMPTION ====================

// Purchase reward (main function)
export const purchaseReward = async (
  userId: string,
  rewardId: string,
  shippingAddress?: ShippingAddress
): Promise<{ success: boolean; message: string; redemptionId?: string }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Get all documents first (all reads before writes)
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      const userData = userDoc.data();
      const userExp = userData.experience || 0;
      
      // 2. Get reward data
      const rewardRef = doc(db, COLLECTIONS.REWARDS, rewardId);
      const rewardDoc = await transaction.get(rewardRef);
      
      if (!rewardDoc.exists()) {
        throw new Error('ไม่พบรางวัลนี้');
      }
      
      const reward = rewardDoc.data() as Reward;
      
      // 3. Get inventory if needed for digital rewards
      let inventoryDoc;
      let needsInventoryUpdate = !reward.requiresShipping;
      
      if (needsInventoryUpdate) {
        const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, userId);
        inventoryDoc = await transaction.get(inventoryRef);
      }
      
      // 4. Validate purchase (no writes yet)
      if (!reward.isActive) {
        throw new Error('รางวัลนี้ไม่เปิดให้แลกแล้ว');
      }
      
      if (userExp < reward.price) {
        throw new Error(`EXP ไม่พอ (ต้องการ ${reward.price} EXP)`);
      }
      
      if (reward.requiredLevel && userData.level < reward.requiredLevel) {
        throw new Error(`ต้องการ Level ${reward.requiredLevel} ขึ้นไป`);
      }
      
      if (reward.stock !== undefined && reward.stock <= 0) {
        throw new Error('รางวัลหมดแล้ว');
      }
      
      if (reward.requiresShipping && !shippingAddress) {
        throw new Error('กรุณากรอกที่อยู่จัดส่ง');
      }
      
      // 5. Check purchase limit and ownership for digital items
      if (reward.limitPerUser) {
        const existingRedemptions = await getDocs(
          query(
            collection(db, COLLECTIONS.REDEMPTIONS),
            where('userId', '==', userId),
            where('rewardId', '==', rewardId),
            where('status', '!=', RedemptionStatus.CANCELLED)
          )
        );
        
        if (existingRedemptions.size >= reward.limitPerUser) {
          throw new Error(`แลกได้สูงสุด ${reward.limitPerUser} ครั้งต่อคน`);
        }
      }
      
      // Check if digital item already owned
      if (!reward.requiresShipping && needsInventoryUpdate && inventoryDoc) {
        const itemId = reward.itemId || reward.id;
        const inventory = inventoryDoc.exists() ? inventoryDoc.data() as UserInventory : null;
        
        if (inventory) {
          switch (reward.type) {
            case RewardType.AVATAR:
              if (inventory.avatars.includes(itemId)) {
                throw new Error('คุณมี Avatar นี้แล้ว');
              }
              break;
            case RewardType.ACCESSORY:
              if (inventory.accessories.includes(itemId)) {
                throw new Error('คุณมี Accessory นี้แล้ว');
              }
              break;
            case RewardType.TITLE_BADGE:
              if (inventory.titleBadges.includes(itemId)) {
                throw new Error('คุณมี Title Badge นี้แล้ว');
              }
              break;
            case RewardType.BADGE:
              if (inventory.badges.includes(itemId)) {
                throw new Error('คุณมี Badge นี้แล้ว');
              }
              break;
          }
        }
      }
      
      // === NOW ALL WRITES AFTER ALL READS ===
      
      // 6. Create redemption record
      const redemptionRef = doc(collection(db, COLLECTIONS.REDEMPTIONS));
      const redemption: Redemption = {
        id: redemptionRef.id,
        userId,
        rewardId,
        rewardType: reward.type,
        rewardName: reward.name,
        rewardImageUrl: reward.imageUrl,
        expCost: reward.price,
        status: reward.requiresShipping 
          ? RedemptionStatus.PENDING 
          : RedemptionStatus.DELIVERED,  // Digital rewards are DELIVERED immediately
        createdAt: new Date().toISOString(),
        shippingAddress: shippingAddress,
        itemId: reward.itemId || reward.id // Use reward.id as fallback
      };
      
      // Add activation time for boosts
      if (reward.type === RewardType.BOOST) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (reward.boostDuration || 60) * 60000);
        redemption.activatedAt = now.toISOString();
        redemption.expiresAt = expiresAt.toISOString();
      }
      
      // Clean undefined values before saving to Firestore
      const cleanedRedemption = JSON.parse(JSON.stringify(redemption));
      
      transaction.set(redemptionRef, cleanedRedemption);
      
      // 7. Deduct EXP from user
      transaction.update(userRef, {
        experience: userExp - reward.price
      });
      
      // 8. Update stock if applicable
      if (reward.stock !== undefined) {
        transaction.update(rewardRef, {
          stock: reward.stock - 1
        });
      }
      
      // 9. Process digital rewards immediately
      if (!reward.requiresShipping && inventoryDoc !== undefined) {
        processDigitalRewardInTransaction(transaction, userId, reward, redemptionRef.id, inventoryDoc, userData);
      }
      
      return {
        success: true,
        message: reward.requiresShipping 
          ? 'แลกรางวัลสำเร็จ! รอการอนุมัติจากแอดมิน' 
          : 'แลกรางวัลสำเร็จ! ไอเทมถูกส่งให้คุณแล้ว',
        redemptionId: redemptionRef.id
      };
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    };
  }
};

// Process digital rewards within transaction - FIXED VERSION
const processDigitalRewardInTransaction = (
  transaction: any,
  userId: string,
  reward: Reward,
  redemptionId: string,
  inventoryDoc: any,
  userData: any
) => {
  const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, userId);
  
  let inventory: UserInventory;
  
  if (!inventoryDoc.exists()) {
    // Create new inventory
    inventory = {
      userId,
      avatars: [],
      accessories: [],
      titleBadges: [],
      badges: [],
      activeBoosts: []
    };
  } else {
    inventory = inventoryDoc.data() as UserInventory;
  }
  
  // Process based on reward type
  switch (reward.type) {
    case RewardType.AVATAR:
      // Use reward.id if itemId not available
      const avatarId = reward.itemId || reward.id;
      if (avatarId && !inventory.avatars.includes(avatarId)) {
        inventory.avatars.push(avatarId);
      }
      break;
      
    case RewardType.ACCESSORY:
      // Use reward.id if itemId not available
      const accessoryId = reward.itemId || reward.id;
      if (accessoryId && !inventory.accessories.includes(accessoryId)) {
        inventory.accessories.push(accessoryId);
      }
      break;
      
    case RewardType.TITLE_BADGE:
      // Use reward.id if itemId not available
      const titleId = reward.itemId || reward.id;
      if (titleId && !inventory.titleBadges.includes(titleId)) {
        inventory.titleBadges.push(titleId);
      }
      break;
      
    case RewardType.BADGE:
      // Use reward.id if itemId not available
      const badgeId = reward.itemId || reward.id;
      if (badgeId && !inventory.badges.includes(badgeId)) {
        inventory.badges.push(badgeId);
      }
      break;
      
    case RewardType.BOOST:
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (reward.boostDuration || 60) * 60000);
      
      const boost: ActiveBoost = {
        id: `boost_${Date.now()}`,
        redemptionId,
        multiplier: reward.boostMultiplier || 2,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      
      inventory.activeBoosts.push(boost);
      break;
  }
  
  // Save inventory
  transaction.set(inventoryRef, inventory);
  
  // Update user's avatar data if it's avatar/accessory
  if (reward.type === RewardType.AVATAR || reward.type === RewardType.ACCESSORY) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    // Get current avatarData or create default
    let currentAvatarData = userData.avatarData || {
      currentAvatar: {
        type: 'basic',
        id: userData.avatar || 'knight',
        accessories: {}
      },
      unlockedPremiumAvatars: [],
      unlockedAccessories: []
    };
    
    // Update the unlocked items
    if (reward.type === RewardType.AVATAR) {
      const avatarId = reward.itemId || reward.id;
      if (avatarId && !currentAvatarData.unlockedPremiumAvatars.includes(avatarId)) {
        currentAvatarData.unlockedPremiumAvatars.push(avatarId);
      }
    } else if (reward.type === RewardType.ACCESSORY) {
      const accessoryId = reward.itemId || reward.id;
      if (accessoryId && !currentAvatarData.unlockedAccessories.includes(accessoryId)) {
        currentAvatarData.unlockedAccessories.push(accessoryId);
      }
    }
    
    // Update user document with complete avatarData
    transaction.update(userRef, {
      avatarData: currentAvatarData
    });
  }
  
  // Update title badges in user document
  if (reward.type === RewardType.TITLE_BADGE) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const titleId = reward.itemId || reward.id;
    
    let ownedTitleBadges = userData.ownedTitleBadges || [];
    if (titleId && !ownedTitleBadges.includes(titleId)) {
      ownedTitleBadges.push(titleId);
      
      transaction.update(userRef, {
        ownedTitleBadges: ownedTitleBadges
      });
    }
  }
};

// ==================== USER INVENTORY ====================

// Get user inventory
export const getUserInventory = async (userId: string): Promise<UserInventory | null> => {
  try {
    const docRef = await getDoc(doc(db, COLLECTIONS.USER_INVENTORY, userId));
    if (!docRef.exists()) return null;
    
    return docRef.data() as UserInventory;
  } catch (error) {
    console.error('Error getting inventory:', error);
    return null;
  }
};

// Get active boosts
export const getActiveBoosts = async (userId: string): Promise<ActiveBoost[]> => {
  try {
    const inventory = await getUserInventory(userId);
    if (!inventory) return [];
    
    const now = new Date();
    
    // Filter out expired boosts
    const activeBoosts = inventory.activeBoosts.filter(boost => {
      return new Date(boost.expiresAt) > now;
    });
    
    // Update if any expired boosts were removed
    if (activeBoosts.length !== inventory.activeBoosts.length) {
      await updateDoc(doc(db, COLLECTIONS.USER_INVENTORY, userId), {
        activeBoosts
      });
    }
    
    return activeBoosts;
  } catch (error) {
    console.error('Error getting active boosts:', error);
    return [];
  }
};

// ==================== REDEMPTION HISTORY ====================

// Get user's redemption history
export const getUserRedemptions = async (
  userId: string,
  limitCount?: number
): Promise<Redemption[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.REDEMPTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Redemption));
  } catch (error) {
    console.error('Error getting redemptions:', error);
    return [];
  }
};

// Cancel redemption (for pending physical rewards)
export const cancelRedemption = async (
  redemptionId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Read all documents first
      const redemptionRef = doc(db, COLLECTIONS.REDEMPTIONS, redemptionId);
      const redemptionDoc = await transaction.get(redemptionRef);
      
      if (!redemptionDoc.exists()) {
        throw new Error('ไม่พบข้อมูลการแลกรางวัล');
      }
      
      const redemption = redemptionDoc.data() as Redemption;
      
      // Validate
      if (redemption.userId !== userId) {
        throw new Error('ไม่มีสิทธิ์ยกเลิกรายการนี้');
      }
      
      if (redemption.status !== RedemptionStatus.PENDING) {
        throw new Error('ไม่สามารถยกเลิกรายการที่ดำเนินการแล้ว');
      }
      
      // 2. Read user document
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      const currentExp = userDoc.data().experience || 0;
      
      // 3. Read reward document (if need to restore stock)
      const rewardRef = doc(db, COLLECTIONS.REWARDS, redemption.rewardId);
      const rewardDoc = await transaction.get(rewardRef);
      const hasStock = rewardDoc.exists() && rewardDoc.data().stock !== undefined;
      const currentStock = hasStock ? rewardDoc.data().stock : 0;
      
      // 4. Now do all writes
      // Update redemption status
      transaction.update(redemptionRef, {
        status: RedemptionStatus.CANCELLED,
        cancelReason: reason || 'ยกเลิกโดยผู้ใช้',
        updatedAt: new Date().toISOString()
      });
      
      // Refund EXP to user
      transaction.update(userRef, {
        experience: currentExp + redemption.expCost
      });
      
      // Restore stock if applicable
      if (hasStock) {
        transaction.update(rewardRef, {
          stock: currentStock + 1
        });
      }
      
      return {
        success: true,
        message: 'ยกเลิกและคืน EXP เรียบร้อยแล้ว'
      };
    });
  } catch (error) {
    console.error('Cancel redemption error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    };
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Admin cancel redemption (can cancel any status)
export const adminCancelRedemption = async (
  redemptionId: string,
  reason?: string
): Promise<{ success: boolean; message: string; expRefunded?: number }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Read all documents first
      const redemptionRef = doc(db, COLLECTIONS.REDEMPTIONS, redemptionId);
      const redemptionDoc = await transaction.get(redemptionRef);
      
      if (!redemptionDoc.exists()) {
        throw new Error('ไม่พบข้อมูลการแลกรางวัล');
      }
      
      const redemption = redemptionDoc.data() as Redemption;
      
      // Prevent double cancellation
      if (redemption.status === RedemptionStatus.CANCELLED || 
          redemption.status === RedemptionStatus.REFUNDED) {
        throw new Error('รายการนี้ถูกยกเลิกแล้ว');
      }
      
      // 2. Read user document
      const userRef = doc(db, COLLECTIONS.USERS, redemption.userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      const currentExp = userDoc.data().experience || 0;
      
      // 3. Read reward document (if need to restore stock)
      const rewardRef = doc(db, COLLECTIONS.REWARDS, redemption.rewardId);
      const rewardDoc = await transaction.get(rewardRef);
      const hasStock = rewardDoc.exists() && rewardDoc.data().stock !== undefined;
      const currentStock = hasStock ? rewardDoc.data().stock : 0;
      
      // 4. Read inventory for digital rewards
      let inventoryDoc;
      let needsInventoryCleanup = redemption.rewardType !== RewardType.PHYSICAL;
      
      if (needsInventoryCleanup) {
        const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, redemption.userId);
        inventoryDoc = await transaction.get(inventoryRef);
      }
      
      // === NOW ALL WRITES ===
      
      // 5. Update redemption status
      const newStatus = redemption.rewardType === RewardType.PHYSICAL 
        ? RedemptionStatus.CANCELLED 
        : RedemptionStatus.REFUNDED;
        
      transaction.update(redemptionRef, {
        status: newStatus,
        cancelReason: reason || 'ยกเลิกโดย Admin',
        adminNotes: reason || 'ยกเลิกโดย Admin',
        updatedAt: new Date().toISOString()
      });
      
      // 6. Refund EXP (always refund for admin cancellation)
      transaction.update(userRef, {
        experience: currentExp + redemption.expCost
      });
      
      // 7. Restore stock if applicable
      if (hasStock) {
        transaction.update(rewardRef, {
          stock: currentStock + 1
        });
      }
      
      // 8. Clean up digital rewards from inventory
      if (needsInventoryCleanup && inventoryDoc?.exists()) {
        cleanupDigitalRewardFromInventory(
          transaction,
          redemption,
          inventoryDoc,
          userDoc.data()
        );
      }
      
      return {
        success: true,
        message: `ยกเลิกและคืน ${redemption.expCost} EXP เรียบร้อยแล้ว`,
        expRefunded: redemption.expCost
      };
    });
  } catch (error) {
    console.error('Admin cancel redemption error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
    };
  }
};

// Helper function to clean up digital rewards from inventory
const cleanupDigitalRewardFromInventory = (
  transaction: any,
  redemption: Redemption,
  inventoryDoc: any,
  userData: any
) => {
  const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, redemption.userId);
  const inventory = inventoryDoc.data() as UserInventory;
  const itemId = redemption.itemId || redemption.rewardId;
  
  let needsUpdate = false;
  const updates: any = {};
  
  // Remove from inventory based on type
  switch (redemption.rewardType) {
    case RewardType.AVATAR:
      if (inventory.avatars?.includes(itemId)) {
        updates.avatars = inventory.avatars.filter((id: string) => id !== itemId);
        needsUpdate = true;
      }
      break;
      
    case RewardType.ACCESSORY:
      if (inventory.accessories?.includes(itemId)) {
        updates.accessories = inventory.accessories.filter((id: string) => id !== itemId);
        needsUpdate = true;
      }
      break;
      
    case RewardType.TITLE_BADGE:
      if (inventory.titleBadges?.includes(itemId)) {
        updates.titleBadges = inventory.titleBadges.filter((id: string) => id !== itemId);
        needsUpdate = true;
      }
      break;
      
    case RewardType.BADGE:
      if (inventory.badges?.includes(itemId)) {
        updates.badges = inventory.badges.filter((id: string) => id !== itemId);
        needsUpdate = true;
      }
      break;
      
    case RewardType.BOOST:
      // Remove active boost
      if (inventory.activeBoosts?.length > 0) {
        updates.activeBoosts = inventory.activeBoosts.filter(
          (boost: ActiveBoost) => boost.redemptionId !== redemption.id
        );
        needsUpdate = true;
      }
      break;
  }
  
  if (needsUpdate) {
    transaction.update(inventoryRef, updates);
  }
  
  // Update user avatarData if needed
  if (redemption.rewardType === RewardType.AVATAR || redemption.rewardType === RewardType.ACCESSORY) {
    cleanupUserAvatarData(transaction, redemption, userData, itemId);
  }
  
  // Update title badges
  if (redemption.rewardType === RewardType.TITLE_BADGE) {
    cleanupUserTitleBadges(transaction, redemption, userData, itemId);
  }
};

// Helper function to clean up user avatar data
const cleanupUserAvatarData = (
  transaction: any,
  redemption: Redemption,
  userData: any,
  itemId: string
) => {
  const userRef = doc(db, COLLECTIONS.USERS, redemption.userId);
  
  if (!userData.avatarData) return;
  
  let needsUpdate = false;
  const avatarData = { ...userData.avatarData };
  
  if (redemption.rewardType === RewardType.AVATAR) {
    // Remove from unlocked avatars
    if (avatarData.unlockedPremiumAvatars?.includes(itemId)) {
      avatarData.unlockedPremiumAvatars = avatarData.unlockedPremiumAvatars.filter(
        (id: string) => id !== itemId
      );
      needsUpdate = true;
    }
    
    // If currently using this avatar, switch to basic
    if (avatarData.currentAvatar?.id === itemId && avatarData.currentAvatar?.type === 'premium') {
      avatarData.currentAvatar = {
        type: 'basic',
        id: userData.avatar || 'knight',
        accessories: avatarData.currentAvatar.accessories || {}
      };
      needsUpdate = true;
    }
  } else if (redemption.rewardType === RewardType.ACCESSORY) {
    // Remove from unlocked accessories
    if (avatarData.unlockedAccessories?.includes(itemId)) {
      avatarData.unlockedAccessories = avatarData.unlockedAccessories.filter(
        (id: string) => id !== itemId
      );
      needsUpdate = true;
    }
    
    // Remove from current avatar if equipped
    if (avatarData.currentAvatar?.accessories) {
      const updatedAccessories = { ...avatarData.currentAvatar.accessories };
      let accessoryRemoved = false;
      
      Object.keys(updatedAccessories).forEach(type => {
        if (updatedAccessories[type as keyof typeof updatedAccessories] === itemId) {
          delete updatedAccessories[type as keyof typeof updatedAccessories];
          accessoryRemoved = true;
        }
      });
      
      if (accessoryRemoved) {
        avatarData.currentAvatar.accessories = updatedAccessories;
        needsUpdate = true;
      }
    }
  }
  
  if (needsUpdate) {
    transaction.update(userRef, {
      avatarData: avatarData
    });
  }
};

// Helper function to clean up user title badges
const cleanupUserTitleBadges = (
  transaction: any,
  redemption: Redemption,
  userData: any,
  itemId: string
) => {
  const userRef = doc(db, COLLECTIONS.USERS, redemption.userId);
  
  let needsUpdate = false;
  const updates: any = {};
  
  // Remove from owned title badges
  if (userData.ownedTitleBadges?.includes(itemId)) {
    updates.ownedTitleBadges = userData.ownedTitleBadges.filter(
      (id: string) => id !== itemId
    );
    needsUpdate = true;
  }
  
  // Remove if currently selected
  if (userData.currentTitleBadge === itemId) {
    updates.currentTitleBadge = null;
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    transaction.update(userRef, updates);
  }
};

// Enhanced save reward that handles type changes
export const saveReward = async (
  reward: Partial<Reward>,
  rewardId?: string
): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    const now = new Date().toISOString();
    const data = {
      ...reward,
      updatedAt: now
    };
    
    // If updating existing reward, check for type change
    if (rewardId) {
      const existingDoc = await getDoc(doc(db, COLLECTIONS.REWARDS, rewardId));
      
      if (existingDoc.exists()) {
        const existingReward = existingDoc.data() as Reward;
        const oldItemId = existingReward.itemId || rewardId;
        const newItemId = data.itemId || rewardId;
        
        // Check if type or itemId changed
        if (existingReward.type !== data.type || oldItemId !== newItemId) {
          // Need to clean up old data
          await cleanupRewardTypeChange(
            rewardId,
            existingReward,
            data as Reward
          );
        }
      }
      
      // Update the reward
      await updateDoc(doc(db, COLLECTIONS.REWARDS, rewardId), data);
      
      return {
        success: true,
        message: 'อัพเดทรางวัลเรียบร้อยแล้ว',
        id: rewardId
      };
    } else {
      // Create new reward
      data.createdAt = now;
      data.isActive = true;
      const docRef = doc(collection(db, COLLECTIONS.REWARDS));
      await setDoc(docRef, data);
      
      return {
        success: true,
        message: 'สร้างรางวัลสำเร็จ',
        id: docRef.id
      };
    }
  } catch (error) {
    console.error('Save reward error:', error);
    return {
      success: false,
      message: 'ไม่สามารถบันทึกรางวัลได้'
    };
  }
};

// Helper function to clean up when reward type changes
async function cleanupRewardTypeChange(
  rewardId: string,
  oldReward: Reward,
  newReward: Partial<Reward>
): Promise<void> {
  const batch = writeBatch(db);
  const oldItemId = oldReward.itemId || rewardId;
  const newItemId = newReward.itemId || rewardId;
  
  // Skip if reward types that don't affect inventory
  const inventoryTypes = [
    RewardType.AVATAR,
    RewardType.ACCESSORY,
    RewardType.TITLE_BADGE,
    RewardType.BADGE
  ];
  
  if (!inventoryTypes.includes(oldReward.type)) {
    return;
  }
  
  // Get all inventories
  const inventoryQuery = query(collection(db, COLLECTIONS.USER_INVENTORY));
  const inventorySnapshot = await getDocs(inventoryQuery);
  
  for (const inventoryDoc of inventorySnapshot.docs) {
    const inventory = inventoryDoc.data();
    let needsUpdate = false;
    const updates: any = {};
    
    // Remove from old type array
    switch (oldReward.type) {
      case RewardType.AVATAR:
        if (inventory.avatars?.includes(oldItemId)) {
          updates.avatars = inventory.avatars.filter((id: string) => id !== oldItemId);
          needsUpdate = true;
        }
        break;
        
      case RewardType.ACCESSORY:
        if (inventory.accessories?.includes(oldItemId)) {
          updates.accessories = inventory.accessories.filter((id: string) => id !== oldItemId);
          needsUpdate = true;
        }
        break;
        
      case RewardType.TITLE_BADGE:
        if (inventory.titleBadges?.includes(oldItemId)) {
          updates.titleBadges = inventory.titleBadges.filter((id: string) => id !== oldItemId);
          needsUpdate = true;
        }
        break;
        
      case RewardType.BADGE:
        if (inventory.badges?.includes(oldItemId)) {
          updates.badges = inventory.badges.filter((id: string) => id !== oldItemId);
          needsUpdate = true;
        }
        break;
    }
    
    // Add to new type array if type changed to another inventory type
    if (newReward.type && inventoryTypes.includes(newReward.type) && newReward.type !== oldReward.type) {
      switch (newReward.type) {
        case RewardType.AVATAR:
          if (!updates.avatars) updates.avatars = inventory.avatars || [];
          if (!updates.avatars.includes(newItemId)) {
            updates.avatars.push(newItemId);
            needsUpdate = true;
          }
          break;
          
        case RewardType.ACCESSORY:
          if (!updates.accessories) updates.accessories = inventory.accessories || [];
          if (!updates.accessories.includes(newItemId)) {
            updates.accessories.push(newItemId);
            needsUpdate = true;
          }
          break;
          
        case RewardType.TITLE_BADGE:
          if (!updates.titleBadges) updates.titleBadges = inventory.titleBadges || [];
          if (!updates.titleBadges.includes(newItemId)) {
            updates.titleBadges.push(newItemId);
            needsUpdate = true;
          }
          break;
          
        case RewardType.BADGE:
          if (!updates.badges) updates.badges = inventory.badges || [];
          if (!updates.badges.includes(newItemId)) {
            updates.badges.push(newItemId);
            needsUpdate = true;
          }
          break;
      }
    }
    
    if (needsUpdate) {
      batch.update(doc(db, COLLECTIONS.USER_INVENTORY, inventoryDoc.id), updates);
    }
  }
  
  // Update user avatarData for avatar/accessory changes
  if ((oldReward.type === RewardType.AVATAR || oldReward.type === RewardType.ACCESSORY) ||
      (newReward.type === RewardType.AVATAR || newReward.type === RewardType.ACCESSORY)) {
    
    const usersQuery = query(collection(db, COLLECTIONS.USERS));
    const usersSnapshot = await getDocs(usersQuery);
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (!userData.avatarData) continue;
      
      let needsUpdate = false;
      const avatarData = { ...userData.avatarData };
      
      // Handle old type removal
      if (oldReward.type === RewardType.AVATAR) {
        if (avatarData.unlockedPremiumAvatars?.includes(oldItemId)) {
          avatarData.unlockedPremiumAvatars = avatarData.unlockedPremiumAvatars.filter(
            (id: string) => id !== oldItemId
          );
          needsUpdate = true;
        }
        
        if (avatarData.currentAvatar?.id === oldItemId && avatarData.currentAvatar?.type === 'premium') {
          avatarData.currentAvatar = {
            type: 'basic',
            id: userData.avatar || 'knight',
            accessories: avatarData.currentAvatar.accessories || {}
          };
          needsUpdate = true;
        }
      } else if (oldReward.type === RewardType.ACCESSORY) {
        if (avatarData.unlockedAccessories?.includes(oldItemId)) {
          avatarData.unlockedAccessories = avatarData.unlockedAccessories.filter(
            (id: string) => id !== oldItemId
          );
          needsUpdate = true;
        }
        
        // Remove from equipped accessories
        if (avatarData.currentAvatar?.accessories && oldReward.accessoryType) {
          if (avatarData.currentAvatar.accessories[oldReward.accessoryType] === oldItemId) {
            const updatedAccessories = { ...avatarData.currentAvatar.accessories };
            delete updatedAccessories[oldReward.accessoryType];
            avatarData.currentAvatar.accessories = updatedAccessories;
            needsUpdate = true;
          }
        }
      }
      
      // Handle new type addition (if user already owns it)
      // Need to check from the current inventory document
      const userInventory = inventorySnapshot.docs.find(doc => doc.id === userDoc.id);
      const userInventoryData = userInventory?.data();
      
      const ownsItem = userInventoryData?.avatars?.includes(newItemId) ||
                      userInventoryData?.accessories?.includes(newItemId) ||
                      userInventoryData?.titleBadges?.includes(newItemId) ||
                      userInventoryData?.badges?.includes(newItemId);
                      
      if (ownsItem) {
        if (newReward.type === RewardType.AVATAR) {
          if (!avatarData.unlockedPremiumAvatars) {
            avatarData.unlockedPremiumAvatars = [];
          }
          if (!avatarData.unlockedPremiumAvatars.includes(newItemId)) {
            avatarData.unlockedPremiumAvatars.push(newItemId);
            needsUpdate = true;
          }
        } else if (newReward.type === RewardType.ACCESSORY) {
          if (!avatarData.unlockedAccessories) {
            avatarData.unlockedAccessories = [];
          }
          if (!avatarData.unlockedAccessories.includes(newItemId)) {
            avatarData.unlockedAccessories.push(newItemId);
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), {
          avatarData: avatarData
        });
      }
    }
  }
  
  // Handle title badge changes
  if (oldReward.type === RewardType.TITLE_BADGE) {
    const usersQuery = query(collection(db, COLLECTIONS.USERS));
    const usersSnapshot = await getDocs(usersQuery);
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      let needsUpdate = false;
      const updates: any = {};
      
      if (userData.ownedTitleBadges?.includes(oldItemId)) {
        updates.ownedTitleBadges = userData.ownedTitleBadges.filter(
          (id: string) => id !== oldItemId
        );
        
        // Add new itemId if type is still title badge
        if (newReward.type === RewardType.TITLE_BADGE && newItemId !== oldItemId) {
          updates.ownedTitleBadges.push(newItemId);
        }
        
        needsUpdate = true;
      }
      
      if (userData.currentTitleBadge === oldItemId) {
        if (newReward.type === RewardType.TITLE_BADGE && newItemId !== oldItemId) {
          updates.currentTitleBadge = newItemId;
        } else {
          updates.currentTitleBadge = null;
        }
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), updates);
      }
    }
  }
  
  await batch.commit();
}

// Enhanced delete reward function that cleans up all related data
export const deleteReward = async (rewardId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First get the reward details
    const rewardDoc = await getDoc(doc(db, COLLECTIONS.REWARDS, rewardId));
    if (!rewardDoc.exists()) {
      return {
        success: false,
        message: 'ไม่พบรางวัลนี้'
      };
    }
    
    const reward = rewardDoc.data() as Reward;
    const itemId = reward.itemId || rewardId;
    
    // Start a batch operation
    const batch = writeBatch(db);
    
    // 1. Soft delete the reward (deactivate)
    batch.update(doc(db, COLLECTIONS.REWARDS, rewardId), {
      isActive: false,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // 2. Clean up based on reward type
    if (reward.type !== RewardType.PHYSICAL && reward.type !== RewardType.BOOST) {
      // Get all users who have this item
      const inventoryQuery = query(collection(db, COLLECTIONS.USER_INVENTORY));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      for (const inventoryDoc of inventorySnapshot.docs) {
        const inventory = inventoryDoc.data();
        let needsUpdate = false;
        const updates: any = {};
        
        // Remove from appropriate array based on type
        switch (reward.type) {
          case RewardType.AVATAR:
            if (inventory.avatars?.includes(itemId)) {
              updates.avatars = inventory.avatars.filter((id: string) => id !== itemId);
              needsUpdate = true;
            }
            break;
            
          case RewardType.ACCESSORY:
            if (inventory.accessories?.includes(itemId)) {
              updates.accessories = inventory.accessories.filter((id: string) => id !== itemId);
              needsUpdate = true;
            }
            break;
            
          case RewardType.TITLE_BADGE:
            if (inventory.titleBadges?.includes(itemId)) {
              updates.titleBadges = inventory.titleBadges.filter((id: string) => id !== itemId);
              needsUpdate = true;
            }
            break;
            
          case RewardType.BADGE:
            if (inventory.badges?.includes(itemId)) {
              updates.badges = inventory.badges.filter((id: string) => id !== itemId);
              needsUpdate = true;
            }
            break;
        }
        
        if (needsUpdate) {
          batch.update(doc(db, COLLECTIONS.USER_INVENTORY, inventoryDoc.id), updates);
        }
      }
      
      // 3. Update user avatarData if needed
      if (reward.type === RewardType.AVATAR || reward.type === RewardType.ACCESSORY) {
        const usersQuery = query(collection(db, COLLECTIONS.USERS));
        const usersSnapshot = await getDocs(usersQuery);
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          if (!userData.avatarData) continue;
          
          let needsUpdate = false;
          const avatarData = { ...userData.avatarData };
          
          if (reward.type === RewardType.AVATAR) {
            // Remove from unlocked avatars
            if (avatarData.unlockedPremiumAvatars?.includes(itemId)) {
              avatarData.unlockedPremiumAvatars = avatarData.unlockedPremiumAvatars.filter(
                (id: string) => id !== itemId
              );
              needsUpdate = true;
            }
            
            // If currently using this avatar, switch to basic
            if (avatarData.currentAvatar?.id === itemId && avatarData.currentAvatar?.type === 'premium') {
              avatarData.currentAvatar = {
                type: 'basic',
                id: userData.avatar || 'knight',
                accessories: avatarData.currentAvatar.accessories || {}
              };
              needsUpdate = true;
            }
          } else if (reward.type === RewardType.ACCESSORY) {
            // Remove from unlocked accessories
            if (avatarData.unlockedAccessories?.includes(itemId)) {
              avatarData.unlockedAccessories = avatarData.unlockedAccessories.filter(
                (id: string) => id !== itemId
              );
              needsUpdate = true;
            }
            
            // Remove from current avatar if equipped
            if (avatarData.currentAvatar?.accessories) {
              const updatedAccessories = { ...avatarData.currentAvatar.accessories };
              let accessoryRemoved = false;
              
              Object.keys(updatedAccessories).forEach(type => {
                if (updatedAccessories[type as keyof typeof updatedAccessories] === itemId) {
                  delete updatedAccessories[type as keyof typeof updatedAccessories];
                  accessoryRemoved = true;
                }
              });
              
              if (accessoryRemoved) {
                avatarData.currentAvatar.accessories = updatedAccessories;
                needsUpdate = true;
              }
            }
          }
          
          if (needsUpdate) {
            batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), {
              avatarData: avatarData
            });
          }
        }
      }
      
      // 4. Update title badges in users
      if (reward.type === RewardType.TITLE_BADGE) {
        const usersQuery = query(collection(db, COLLECTIONS.USERS));
        const usersSnapshot = await getDocs(usersQuery);
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          let needsUpdate = false;
          const updates: any = {};
          
          // Remove from owned title badges
          if (userData.ownedTitleBadges?.includes(itemId)) {
            updates.ownedTitleBadges = userData.ownedTitleBadges.filter(
              (id: string) => id !== itemId
            );
            needsUpdate = true;
          }
          
          // Remove if currently selected
          if (userData.currentTitleBadge === itemId) {
            updates.currentTitleBadge = null;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            batch.update(doc(db, COLLECTIONS.USERS, userDoc.id), updates);
          }
        }
      }
    }
    
    // 5. Cancel pending redemptions for this reward
    const redemptionsQuery = query(
      collection(db, COLLECTIONS.REDEMPTIONS),
      where('rewardId', '==', rewardId),
      where('status', '==', RedemptionStatus.PENDING)
    );
    const redemptionsSnapshot = await getDocs(redemptionsQuery);
    
    for (const redemptionDoc of redemptionsSnapshot.docs) {
      batch.update(doc(db, COLLECTIONS.REDEMPTIONS, redemptionDoc.id), {
        status: RedemptionStatus.CANCELLED,
        cancelReason: 'รางวัลถูกลบออกจากระบบ',
        updatedAt: new Date().toISOString()
      });
    }
    
    // Commit all changes
    await batch.commit();
    
    return {
      success: true,
      message: 'ลบรางวัลและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว'
    };
  } catch (error) {
    console.error('Delete reward error:', error);
    return {
      success: false,
      message: 'ไม่สามารถลบรางวัลได้'
    };
  }
};

// Update redemption status (Admin only) - FIXED VERSION
export const updateRedemptionStatus = async (
  redemptionId: string,
  status: RedemptionStatus,
  trackingNumber?: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    return await runTransaction(db, async (transaction) => {
      // 1. Get redemption data first
      const redemptionRef = doc(db, COLLECTIONS.REDEMPTIONS, redemptionId);
      const redemptionDoc = await transaction.get(redemptionRef);
      
      if (!redemptionDoc.exists()) {
        throw new Error('ไม่พบข้อมูลการแลกรางวัล');
      }
      
      const redemption = redemptionDoc.data() as Redemption;
      
      // 2. Get user data for digital rewards processing
      let userDoc, inventoryDoc, rewardDoc;
      let needsDigitalProcessing = false;
      
      // Check if this is a digital reward being set to DELIVERED
      if (status === RedemptionStatus.DELIVERED && 
          redemption.rewardType !== RewardType.PHYSICAL &&
          redemption.status !== RedemptionStatus.DELIVERED) {
        
        needsDigitalProcessing = true;
        
        // Get user data
        const userRef = doc(db, COLLECTIONS.USERS, redemption.userId);
        userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('ไม่พบข้อมูลผู้ใช้');
        }
        
        // Get inventory
        const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, redemption.userId);
        inventoryDoc = await transaction.get(inventoryRef);
        
        // Get reward data for boost processing
        if (redemption.rewardType === RewardType.BOOST) {
          const rewardRef = doc(db, COLLECTIONS.REWARDS, redemption.rewardId);
          rewardDoc = await transaction.get(rewardRef);
        }
      }
      
      // 3. Prepare update data
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (adminNotes) updateData.adminNotes = adminNotes;
      
      // 4. Update redemption status
      transaction.update(redemptionRef, updateData);
      
      // 5. Process digital rewards if needed
      if (needsDigitalProcessing && userDoc && inventoryDoc !== undefined) {
        const userData = userDoc.data();
        
        // Create a mock reward object for processing
        const mockReward: Partial<Reward> = {
          id: redemption.rewardId,
          type: redemption.rewardType,
          name: redemption.rewardName,
          itemId: redemption.itemId || redemption.rewardId,
          boostDuration: rewardDoc?.data()?.boostDuration,
          boostMultiplier: rewardDoc?.data()?.boostMultiplier
        };
        
        // Process the digital reward
        processDigitalRewardInTransaction(
          transaction,
          redemption.userId,
          mockReward as Reward,
          redemptionId,
          inventoryDoc,
          userData
        );
        
        console.log(`✅ Processed digital reward for redemption ${redemptionId}`);
      }
      
      return {
        success: true,
        message: needsDigitalProcessing 
          ? 'อัพเดทสถานะและส่งมอบรางวัลดิจิทัลสำเร็จ'
          : 'อัพเดทสถานะสำเร็จ'
      };
    });
  } catch (error) {
    console.error('Update redemption error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'ไม่สามารถอัพเดทสถานะได้'
    };
  }
};

// Get all redemptions (Admin only)
export const getAllRedemptions = async (
  filterStatus?: RedemptionStatus,
  limitCount?: number
): Promise<Redemption[]> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.REDEMPTIONS),
      orderBy('createdAt', 'desc')
    );
    
    if (filterStatus) {
      q = query(
        collection(db, COLLECTIONS.REDEMPTIONS),
        where('status', '==', filterStatus),
        orderBy('createdAt', 'desc')
      );
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Redemption));
  } catch (error) {
    console.error('Error getting all redemptions:', error);
    return [];
  }
};