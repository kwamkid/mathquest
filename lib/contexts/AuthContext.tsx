// lib/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Check if user is active
        if (!userData.isActive) {
          await auth.signOut();
          setError('บัญชีนี้ถูกระงับการใช้งาน');
          return null;
        }
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userData = await fetchUserData(currentUser);
      setUser(userData);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await fetchUserData(firebaseUser);
          setUser(userData);
          setError(null);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('เกิดข้อผิดพลาดในการตรวจสอบสถานะ');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Auto redirect based on auth state and current path
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (!user && !publicPaths.includes(currentPath)) {
        // Not logged in and trying to access protected route
        router.push('/login');
      } else if (user && publicPaths.includes(currentPath) && currentPath !== '/') {
        // Logged in and on login/register page
        router.push('/play');
      }
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// เพิ่ม default export
export default AuthProvider;