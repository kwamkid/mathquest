import { NextResponse } from 'next/server';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

const ADMIN_SECRET = 'your-secret-key-123'; // เปลี่ยนเป็นรหัสลับ

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const usersSnapshot = await getDocs(collection(db, 'users'));
  let migratedCount = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    if (userData.dailyStreak !== undefined && userData.playStreak === undefined) {
      await updateDoc(doc(db, 'users', userDoc.id), {
        playStreak: userData.dailyStreak || 0
      });
      migratedCount++;
    }
  }
  
  return NextResponse.json({
    success: true,
    migrated: migratedCount,
    total: usersSnapshot.size
  });
}