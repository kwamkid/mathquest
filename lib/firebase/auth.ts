// lib/firebase/auth.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './client';
import { User, Grade } from '@/types';

// Firebase collections
const COLLECTIONS = {
  USERS: 'users',
  USERNAMES: 'usernames',
  REGISTRATION_CODES: 'registrationCodes',
} as const;

// Create a fake email from username
const createEmailFromUsername = (username: string) => {
  return `${username.toLowerCase()}@mathquest.local`;
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username || username.length < 1) return false;
  
  try {
    const usernameDoc = await getDoc(doc(db, COLLECTIONS.USERNAMES, username.toLowerCase()));
    return !usernameDoc.exists();
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

// Sign up new user
export const signUp = async (
  username: string,
  password: string,
  displayName: string | undefined,
  avatar: string,
  school: string,
  grade: string,
  registrationCode: string
): Promise<User> => {
  try {
    console.log('1. Checking username availability...');
    // 1. Check if username already exists
    const usernameDoc = await getDoc(doc(db, COLLECTIONS.USERNAMES, username.toLowerCase()));
    if (usernameDoc.exists()) {
      throw new Error('Username นี้มีผู้ใช้แล้ว');
    }

    console.log('2. Validating registration code...');
    // 2. Validate registration code - ค้นหาจาก field 'code' แทน document ID
    const codesQuery = query(
      collection(db, COLLECTIONS.REGISTRATION_CODES),
      where('code', '==', registrationCode),
      where('isActive', '==', true), // เพิ่ม filter เพื่อป้องกัน code ซ้ำที่ inactive
      limit(1)
    );
    const codesSnapshot = await getDocs(codesQuery);
    
    if (codesSnapshot.empty) {
      throw new Error('Registration Code ไม่ถูกต้อง');
    }

    const codeDoc = codesSnapshot.docs[0];
    const codeData = codeDoc.data();
    
    if (!codeData.isActive) {
      throw new Error('Registration Code นี้ถูกระงับการใช้งาน');
    }

    // Check usage limit
    if (codeData.maxUses && codeData.currentUses >= codeData.maxUses) {
      throw new Error('Registration Code นี้ถูกใช้งานเต็มจำนวนแล้ว');
    }

    // Check expiry date
    if (codeData.expiresAt) {
      const expiryDate = new Date(codeData.expiresAt);
      if (expiryDate < new Date()) {
        throw new Error('Registration Code นี้หมดอายุแล้ว');
      }
    }

    console.log('3. Creating auth user...');
    // 3. Create authentication user
    const email = createEmailFromUsername(username);
    let userCredential;
    
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (authError: unknown) {
      console.error('Auth creation error:', authError);
      if (authError instanceof Error && 'code' in authError && authError.code === 'auth/email-already-in-use') {
        throw new Error('Username นี้มีผู้ใช้แล้ว');
      }
      throw authError;
    }
    
    const user = userCredential.user;
    console.log('Auth user created:', user.uid);

    try {
      console.log('4. Creating user document...');
      // 4. Create user document
      const now = new Date().toISOString();
      const userData: User = {
        id: user.uid,
        username: username.toLowerCase(),
        displayName: displayName || undefined,
        email,
        avatar,
        school,
        grade: grade as Grade,
        level: 1,
        experience: 0,
        totalScore: 0,
        playStreak: 0, // ✅ ใช้ playStreak อย่างเดียว (ไม่มี dailyStreak)
        lastLoginDate: now,
        registrationCode,
        createdAt: now,
        isActive: true,
      };

      // 5. Save to Firestore (remove undefined fields)
      const userDataToSave = Object.fromEntries(
        Object.entries(userData).filter(([, value]) => value !== undefined)
      );
      
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDataToSave);
      
      // 6. Save username mapping
      await setDoc(doc(db, COLLECTIONS.USERNAMES, username.toLowerCase()), {
        userId: user.uid,
        createdAt: now,
      });

      // 7. Update registration code usage - ใช้ document ID ที่ได้จากการ query
      await updateDoc(doc(db, COLLECTIONS.REGISTRATION_CODES, codeDoc.id), {
        currentUses: (codeData.currentUses || 0) + 1,
        lastUsedAt: now,
      });

      return userData;
    } catch (firestoreError) {
      // If Firestore operations fail, delete the auth user
      await user.delete();
      throw firestoreError;
    }
  } catch (error: unknown) {
    // Handle Firebase auth errors
    if (error instanceof Error) {
      if ('code' in error) {
        const errorCode = (error as { code?: string }).code;
        if (errorCode === 'auth/email-already-in-use') {
          throw new Error('Username นี้มีผู้ใช้แล้ว');
        } else if (errorCode === 'auth/invalid-email') {
          throw new Error('Username ไม่ถูกต้อง');
        } else if (errorCode === 'auth/weak-password') {
          throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }
      }
      if (error.message) {
        // Re-throw our custom errors
        throw error;
      }
    }
    // Unknown error
    throw new Error('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
  }
};

// Sign in existing user with remember me option
export const signIn = async (username: string, password: string, rememberMe: boolean = false): Promise<User> => {
  const email = createEmailFromUsername(username);
  
  try {
    // Set persistence based on rememberMe
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
    // Try to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));
    if (!userDoc.exists()) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const userData = userDoc.data() as User;
    
    // Check if user is active
    if (!userData.isActive) {
      await firebaseSignOut(auth);
      throw new Error('บัญชีนี้ถูกระงับการใช้งาน');
    }

    // ✅ แก้ไข: Update last login only (ไม่อัพเดท streak ที่นี่)
    // Streak จะอัพเดทตอนเล่นเกมใน lib/firebase/game.ts
    const today = new Date();

    // Update user document - เฉพาะ lastLoginDate
    await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
      lastLoginDate: today.toISOString(),
    });

    return {
      ...userData,
      lastLoginDate: today.toISOString(),
    };
  } catch (error: unknown) {
    console.log('Sign in error details:', error);
    
    // Type guard สำหรับ Firebase error
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as {code: string}).code;
      
      // Map Firebase error codes to Thai messages
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'Username หรือรหัสผ่านไม่ถูกต้อง',
        'auth/invalid-login-credentials': 'Username หรือรหัสผ่านไม่ถูกต้อง',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
        'auth/user-not-found': 'ไม่พบ Username นี้ในระบบ',
        'auth/invalid-email': 'Username ไม่ถูกต้อง',
        'auth/user-disabled': 'บัญชีนี้ถูกระงับการใช้งาน',
        'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง',
        'auth/network-request-failed': 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      };
      
      const message = errorMessages[errorCode] || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      // Return a clean error without Firebase details
      return Promise.reject(new Error(message));
    }
    
    // If it's our custom error, re-throw it
    if (error instanceof Error && error.message) {
      return Promise.reject(error);
    }
    
    // Unknown error
    return Promise.reject(new Error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'));
  }
};

// Sign out
export const signOut = async () => {
  await firebaseSignOut(auth);
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getCurrentUser();
      callback(userData);
    } else {
      callback(null);
    }
  });
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: {
    displayName?: string;
    school?: string;
    grade?: string;
    avatar?: string;
  }
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!userDoc.exists()) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const currentData = userDoc.data() as User;
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If grade changed, reset level to 1
    if (updates.grade && updates.grade !== currentData.grade) {
      updateData.level = 1;
      // Optionally reset other grade-specific data
      updateData.experience = 0;
      updateData.levelScores = {};
      updateData.playStreak = 0; // ✅ reset playStreak เมื่อเปลี่ยนระดับชั้น
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
  }
};

// ✅ เพิ่มฟังก์ชัน Migration สำหรับ users เก่า (optional)
export const migrateStreakData = async (): Promise<void> => {
  try {
    console.log('🔄 Starting streak migration...');
    
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    let migratedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // ถ้ามี dailyStreak แต่ไม่มี playStreak
      if (userData.dailyStreak !== undefined && userData.playStreak === undefined) {
        await updateDoc(doc(db, COLLECTIONS.USERS, userDoc.id), {
          playStreak: userData.dailyStreak || 0,
          // Note: ใน Firestore ไม่สามารถลบ field ได้โดยตรง
          // ต้องใช้ deleteField() จาก firebase/firestore หรือ set ค่าเป็น null
        });
        migratedCount++;
        console.log(`✅ Migrated user ${userDoc.id}`);
      }
    }
    
    console.log(`✅ Migration complete! Updated ${migratedCount} users`);
  } catch (error) {
    console.error('Migration error:', error);
    throw new Error('ไม่สามารถ migrate streak data ได้');
  }
};