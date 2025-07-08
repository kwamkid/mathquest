// components/auth/AuthGuard.tsx
'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pi } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/login');
    }
  }, [user, loading, requireAuth, router]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl relative z-10"
        >
          <Pi className="w-24 h-24 text-metaverse-purple filter drop-shadow-[0_0_30px_rgba(147,51,234,0.5)]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute mt-40 text-white/60 text-lg"
        >
          กำลังโหลด...
        </motion.p>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}