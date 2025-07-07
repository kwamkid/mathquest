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
  Timestamp
} from 'firebase/firestore';
import { db } from './client';
import { 
  Reward, 
  RewardType, 
  Redemption, 
  RedemptionStatus,
  UserInventory,
  ActiveBoost,
  ShippingAddress 
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

// Get single reward
export const getReward = async (rewardId: string): Promise<Reward | null> => {
  try {
    const docRef = await getDoc(doc(db, COLLECTIONS.REWARDS, rewardId));
    if (!docRef.exists()) return null;
    
    return {
      id: docRef.id,
      ...docRef.data()
    } as Reward;
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
      // 1. Get user data
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
      
      // 3. Validate purchase
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
      
      // 4. Check purchase limit
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
      
      // 5. Create redemption record
      const redemptionRef = doc(collection(db, COLLECTIONS.REDEMPTIONS));
      const redemption: Redemption = {
        id: redemptionRef.id,
        userId,
        rewardId,
        rewardType: reward.type,
        rewardName: reward.name,
        expCost: reward.price,
        status: reward.requiresShipping 
          ? RedemptionStatus.PENDING 
          : RedemptionStatus.APPROVED,
        createdAt: new Date().toISOString(),
        shippingAddress: shippingAddress,
        itemId: reward.itemId
      };
      
      transaction.set(redemptionRef, redemption);
      
      // 6. Deduct EXP from user
      transaction.update(userRef, {
        experience: userExp - reward.price
      });
      
      // 7. Update stock if applicable
      if (reward.stock !== undefined) {
        transaction.update(rewardRef, {
          stock: reward.stock - 1
        });
      }
      
      // 8. Process digital rewards immediately
      if (!reward.requiresShipping) {
        await processDigitalReward(transaction, userId, reward, redemptionRef.id);
      }
      
      return {
        success: true,
        message: reward.requiresShipping 
          ? 'แลกรางวัลสำเร็จ! รอการอนุมัติจากแอดมิน' 
          : 'แลกรางวัลสำเร็จ!',
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

// Process digital rewards
const processDigitalReward = async (
  transaction: any,
  userId: string,
  reward: Reward,
  redemptionId: string
) => {
  const inventoryRef = doc(db, COLLECTIONS.USER_INVENTORY, userId);
  const inventoryDoc = await transaction.get(inventoryRef);
  
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
      if (reward.itemId && !inventory.avatars.includes(reward.itemId)) {
        inventory.avatars.push(reward.itemId);
      }
      break;
      
    case RewardType.ACCESSORY:
      if (reward.itemId && !inventory.accessories.includes(reward.itemId)) {
        inventory.accessories.push(reward.itemId);
      }
      break;
      
    case RewardType.TITLE_BADGE:
      if (reward.itemId && !inventory.titleBadges.includes(reward.itemId)) {
        inventory.titleBadges.push(reward.itemId);
      }
      break;
      
    case RewardType.BADGE:
      if (reward.itemId && !inventory.badges.includes(reward.itemId)) {
        inventory.badges.push(reward.itemId);
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
      
      // Update redemption with activation time
      transaction.update(doc(db, COLLECTIONS.REDEMPTIONS, redemptionId), {
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: RedemptionStatus.DELIVERED
      });
      break;
  }
  
  // Save inventory
  transaction.set(inventoryRef, inventory);
  
  // Update user's avatar data if it's avatar/accessory
  if (reward.type === RewardType.AVATAR || reward.type === RewardType.ACCESSORY) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    if (reward.type === RewardType.AVATAR && reward.itemId) {
      transaction.update(userRef, {
        'avatarData.unlockedPremiumAvatars': inventory.avatars
      });
    } else if (reward.type === RewardType.ACCESSORY && reward.itemId) {
      transaction.update(userRef, {
        'avatarData.unlockedAccessories': inventory.accessories
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
      // Get redemption
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
      
      // Refund EXP
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists()) {
        const currentExp = userDoc.data().experience || 0;
        transaction.update(userRef, {
          experience: currentExp + redemption.expCost
        });
      }
      
      // Update redemption status
      transaction.update(redemptionRef, {
        status: RedemptionStatus.CANCELLED,
        cancelReason: reason || 'ยกเลิกโดยผู้ใช้',
        updatedAt: new Date().toISOString()
      });
      
      // Restore stock if applicable
      const rewardRef = doc(db, COLLECTIONS.REWARDS, redemption.rewardId);
      const rewardDoc = await transaction.get(rewardRef);
      
      if (rewardDoc.exists()) {
        const reward = rewardDoc.data();
        if (reward.stock !== undefined) {
          transaction.update(rewardRef, {
            stock: reward.stock + 1
          });
        }
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

// Create/Update reward (Admin only)
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
    
    if (!rewardId) {
      // Create new
      data.createdAt = now;
      data.isActive = true;
      const docRef = doc(collection(db, COLLECTIONS.REWARDS));
      await setDoc(docRef, data);
      return {
        success: true,
        message: 'สร้างรางวัลสำเร็จ',
        id: docRef.id
      };
    } else {
      // Update existing
      await updateDoc(doc(db, COLLECTIONS.REWARDS, rewardId), data);
      return {
        success: true,
        message: 'อัพเดทรางวัลสำเร็จ',
        id: rewardId
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

// Delete reward (Admin only)
export const deleteReward = async (rewardId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Soft delete - just deactivate
    await updateDoc(doc(db, COLLECTIONS.REWARDS, rewardId), {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      message: 'ลบรางวัลสำเร็จ'
    };
  } catch (error) {
    console.error('Delete reward error:', error);
    return {
      success: false,
      message: 'ไม่สามารถลบรางวัลได้'
    };
  }
};

// Update redemption status (Admin only)
export const updateRedemptionStatus = async (
  redemptionId: string,
  status: RedemptionStatus,
  trackingNumber?: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (adminNotes) updateData.adminNotes = adminNotes;
    
    await updateDoc(doc(db, COLLECTIONS.REDEMPTIONS, redemptionId), updateData);
    
    return {
      success: true,
      message: 'อัพเดทสถานะสำเร็จ'
    };
  } catch (error) {
    console.error('Update redemption error:', error);
    return {
      success: false,
      message: 'ไม่สามารถอัพเดทสถานะได้'
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