// scripts/fixDigitalRewards.ts
// Script สำหรับแก้ไขสถานะ Digital Rewards จาก APPROVED เป็น DELIVERED

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  getDoc,
  runTransaction 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { RedemptionStatus, RewardType } from '@/types/avatar';

// Function หลักสำหรับแก้ไขข้อมูล
export async function fixDigitalRewardsStatus() {
  console.log('🔧 Starting fix for digital rewards status...');
  
  try {
    // หาทุก redemptions ที่เป็น digital และติดสถานะ APPROVED
    const digitalTypes = [
      RewardType.AVATAR,
      RewardType.ACCESSORY, 
      RewardType.TITLE_BADGE,
      RewardType.BADGE,
      RewardType.BOOST
    ];
    
    let totalFixed = 0;
    
    for (const rewardType of digitalTypes) {
      console.log(`\n📦 Processing ${rewardType} rewards...`);
      
      const q = query(
        collection(db, 'redemptions'),
        where('rewardType', '==', rewardType),
        where('status', '==', RedemptionStatus.APPROVED)
      );
      
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.size} ${rewardType} redemptions to fix`);
      
      for (const redemptionDoc of snapshot.docs) {
        const redemption = redemptionDoc.data();
        
        try {
          await runTransaction(db, async (transaction) => {
            // อัพเดทสถานะเป็น DELIVERED
            transaction.update(doc(db, 'redemptions', redemptionDoc.id), {
              status: RedemptionStatus.DELIVERED,
              updatedAt: new Date().toISOString(),
              adminNotes: 'Fixed by script: Digital reward auto-delivered'
            });
            
            // ถ้าเป็น BOOST ให้เพิ่ม activatedAt และ expiresAt
            if (rewardType === RewardType.BOOST) {
              const now = new Date();
              const expiresAt = new Date(now.getTime() + (redemption.boostDuration || 60) * 60000);
              
              transaction.update(doc(db, 'redemptions', redemptionDoc.id), {
                activatedAt: now.toISOString(),
                expiresAt: expiresAt.toISOString()
              });
            }
          });
          
          console.log(`✅ Fixed redemption ${redemptionDoc.id} (${rewardType})`);
          totalFixed++;
          
        } catch (error) {
          console.error(`❌ Failed to fix ${redemptionDoc.id}:`, error);
        }
      }
    }
    
    console.log(`\n🎉 Fixed total: ${totalFixed} digital rewards`);
    return { success: true, fixed: totalFixed };
    
  } catch (error) {
    console.error('💥 Error in fix script:', error);
    return { success: false, error: error.message };
  }
}

// Function สำหรับตรวจสอบก่อนแก้ไข
export async function checkDigitalRewardsStatus() {
  console.log('🔍 Checking digital rewards status...');
  
  const digitalTypes = [
    RewardType.AVATAR,
    RewardType.ACCESSORY, 
    RewardType.TITLE_BADGE,
    RewardType.BADGE,
    RewardType.BOOST
  ];
  
  const report: Record<string, number> = {};
  
  for (const rewardType of digitalTypes) {
    const q = query(
      collection(db, 'redemptions'),
      where('rewardType', '==', rewardType),
      where('status', '==', RedemptionStatus.APPROVED)
    );
    
    const snapshot = await getDocs(q);
    report[rewardType] = snapshot.size;
  }
  
  console.log('📊 Digital rewards stuck at APPROVED status:');
  Object.entries(report).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`  ${type}: ${count} items`);
    }
  });
  
  const total = Object.values(report).reduce((sum, count) => sum + count, 0);
  console.log(`📋 Total items to fix: ${total}`);
  
  return report;
}

// Function สำหรับรันจาก Console (สำหรับทดสอบ)
export async function runFixFromConsole() {
  console.log('🚀 Running fix from browser console...');
  
  // ตรวจสอบก่อน
  const report = await checkDigitalRewardsStatus();
  const total = Object.values(report).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    console.log('✨ No digital rewards need fixing!');
    return;
  }
  
  // ขอ confirmation
  const confirmed = confirm(`Found ${total} digital rewards to fix. Continue?`);
  if (!confirmed) {
    console.log('❌ Fix cancelled by user');
    return;
  }
  
  // รันการแก้ไข
  const result = await fixDigitalRewardsStatus();
  
  if (result.success) {
    console.log(`🎉 Successfully fixed ${result.fixed} items!`);
    alert(`Fixed ${result.fixed} digital rewards successfully!`);
  } else {
    console.error(`💥 Fix failed: ${result.error}`);
    alert(`Fix failed: ${result.error}`);
  }
}

// สำหรับรันใน Admin Panel
export async function adminRunFix() {
  return await fixDigitalRewardsStatus();
}

// Export สำหรับใช้ใน browser console
if (typeof window !== 'undefined') {
  (window as any).fixDigitalRewards = runFixFromConsole;
  (window as any).checkDigitalRewards = checkDigitalRewardsStatus;
}