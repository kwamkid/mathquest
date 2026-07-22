// app/(game)/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Each play mode gets its own background hue so kids always know which section
// they're in. The class only sets CSS variables (see .theme-* in globals.css)
// that .learn-bg reads — it paints no background itself, so pages with their
// own bg (e.g. /play's arena) are unaffected, and the extra wrapper box is
// inert (no transform/filter, so it never traps fixed/sticky children).
function themeForPath(pathname: string): string {
  if (pathname.startsWith('/typing')) return 'theme-typing';
  if (pathname.startsWith('/timetable')) return 'theme-timetable';
  if (pathname.startsWith('/play')) return 'theme-quiz';
  if (pathname.startsWith('/learn') || pathname.startsWith('/life-math')) {
    return 'theme-lesson';
  }
  return ''; // home + everything else keeps the default purple/pink
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className={themeForPath(pathname)}>{children}</div>
      </ErrorBoundary>
    </AuthProvider>
  );
}
