// app/(game)/layout.tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}