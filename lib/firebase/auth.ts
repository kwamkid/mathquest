// lib/firebase/auth.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
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
        dailyStreak: 0,
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

// Sign in existing user
export const signIn = async (username: string, password: string): Promise<User> => {
  const email = createEmailFromUsername(username);
  
  try {
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

    // Update last login and daily streak
    const lastLogin = new Date(userData.lastLoginDate);
    const today = new Date();
    const diffTime = today.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let newStreak = userData.dailyStreak;
    if (diffDays === 1) {
      // Consecutive day login
      newStreak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1;
    }
    // If diffDays === 0, same day login, keep streak

    // Update user document
    await updateDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), {
      lastLoginDate: today.toISOString(),
      dailyStreak: newStreak,
    });

    return {
      ...userData,
      lastLoginDate: today.toISOString(),
      dailyStreak: newStreak,
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