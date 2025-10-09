// app/(game)/layout.tsx
'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </AuthProvider>
  );
}