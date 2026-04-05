'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/api/authService';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { label: 'Dashboard', icon: '🏠', href: '/dashboard/student', id: 'home' },
    { label: 'Courses', icon: '📚', href: '/dashboard/student/courses', id: 'courses' },
    { label: 'Gaming', icon: '🎮', href: '/dashboard/student/gaming', id: 'gaming' },
    { label: 'AI Chat', icon: '💬', href: '/dashboard/student/chat', id: 'chat' },
    { label: 'Voice Chat', icon: '🎤', href: '/dashboard/student/voice-chat', id: 'voice-chat' },
    { label: 'Profile', icon: '👤', href: '/dashboard/student/profile', id: 'profile' },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  const getActiveLabel = () => {
    const activeItem = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return activeItem ? `${activeItem.icon} ${activeItem.label}` : '🎓 Student Workspace';
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between gap-3 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center"
            aria-label="Open student menu"
          >
            ☰
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Student</p>
            <p className="text-sm font-black text-slate-900 truncate">{getActiveLabel()}</p>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close student menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-black text-slate-900">🎓 ALIA</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Student Workspace</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600"
                aria-label="Close student menu"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Mode</p>
              <p className="text-sm font-bold text-slate-900">Learning Active</p>
            </div>

            <button
              onClick={async () => {
                await handleLogout();
                setIsMobileMenuOpen(false);
              }}
              disabled={isLoggingOut}
              className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 z-50 bg-white border-r border-slate-200">
        <div className="w-full h-full text-slate-900 p-4 flex flex-col">
          <div className="px-3 pt-2 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-black tracking-tight">🎓 ALIA</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">Student Workspace</p>
          </div>

          <nav className="mt-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">Mode</p>
            <p className="text-sm font-bold text-slate-900">Learning Active</p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
};
