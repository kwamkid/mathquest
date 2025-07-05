// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pi, LayoutDashboard, Ticket, Users, ChartBar, Menu, X as XIcon } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const checkAuth = () => {
      const adminAuth = localStorage.getItem('adminAuth');
      
      // List of paths that don't require authentication
      const publicPaths = ['/admin/login', '/admin'];
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!adminAuth && !isPublicPath) {
        router.push('/admin/login');
      } else if (adminAuth === 'true') {
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  // Navigation items
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/codes', label: 'Registration Codes', icon: 'Ticket' },
    { href: '/admin/students', label: 'นักเรียน', icon: 'Users' },
    { href: '/admin/reports', label: 'รายงาน', icon: 'ChartBar' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-metaverse-black flex items-center justify-center">
        <div className="absolute inset-0 bg-metaverse-gradient opacity-30"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl relative z-10"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  // If on login page or index page, just render children
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>;
  }

  // For other admin pages, show layout
  return (
    <div className="min-h-screen bg-metaverse-black text-white">
      <div className="absolute inset-0 bg-metaverse-gradient opacity-20"></div>
      
      {/* Header */}
      <header className="relative z-40 glass-dark border-b border-metaverse-purple/30">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-white p-2 mr-3"
              >
                {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <Pi className="w-10 h-10 text-metaverse-purple filter drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]" />
                <div className="hidden sm:block">
                  <h1 className="font-bold text-white">MathQuest Admin</h1>
                  <p className="text-xs text-white/60">Administration Portal</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80 hidden sm:inline">👤 Admin</span>
              <button
                onClick={handleLogout}
                className="text-sm text-metaverse-pink hover:text-metaverse-glow font-medium transition"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-30 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 glass-dark border-r border-metaverse-purple/30 min-h-[calc(100vh-4rem)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        isActive
                          ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-red text-white shadow-lg'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.icon === 'LayoutDashboard' && <LayoutDashboard className="w-5 h-5" />}
                      {item.icon === 'Ticket' && <Ticket className="w-5 h-5" />}
                      {item.icon === 'Users' && <Users className="w-5 h-5" />}
                      {item.icon === 'ChartBar' && <ChartBar className="w-5 h-5" />}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
              />
              
              {/* Sidebar */}
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25 }}
                className="lg:hidden fixed left-0 top-0 h-full w-72 glass-dark z-50 border-r border-metaverse-purple/30"
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-metaverse-purple/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pi className="w-10 h-10 text-metaverse-purple filter drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]" />
                      <div>
                        <h2 className="font-bold text-white">MathQuest</h2>
                        <p className="text-xs text-white/60">Admin Portal</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Navigation */}
                <nav className="p-4">
                  <ul className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                              isActive
                                ? 'bg-gradient-to-r from-metaverse-purple to-metaverse-red text-white shadow-lg'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {item.icon === 'LayoutDashboard' && <LayoutDashboard className="w-5 h-5" />}
                            {item.icon === 'Ticket' && <Ticket className="w-5 h-5" />}
                            {item.icon === 'Users' && <Users className="w-5 h-5" />}
                            {item.icon === 'ChartBar' && <ChartBar className="w-5 h-5" />}
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}