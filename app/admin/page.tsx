// app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    
    if (adminAuth === 'true') {
      // If authenticated, redirect to dashboard
      router.replace('/admin/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.replace('/admin/login');
    }
  }, [router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">กำลังตรวจสอบ...</p>
      </div>
    </div>
  );
}