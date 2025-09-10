// scripts/migrateStreak.ts
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const migrateStreakData = async () => {
  console.log('🔄 Starting streak migration...');
  
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  let count = 0;
  
  for (const userDoc of snapshot.docs) {
    const userData = userDoc.data();
    
    // ถ้ามี dailyStreak แต่ไม่มี playStreak
    if (userData.dailyStreak !== undefined) {
      const updates: any = {};
      
      // ถ้าไม่มี playStreak ให้ใช้ค่าจาก dailyStreak
      if (userData.playStreak === undefined) {
        updates.playStreak = userData.dailyStreak;
      }
      
      // ลบ dailyStreak ออก (Firestore ไม่มี $unset ต้องใช้ deleteField())
      // updates.dailyStreak = deleteField();
      
      await updateDoc(doc(db, 'users', userDoc.id), updates);
      count++;
      console.log(`✅ Migrated user ${userDoc.id}`);
    }
  }
  
  console.log(`✅ Migration complete! Updated ${count} users`);
};