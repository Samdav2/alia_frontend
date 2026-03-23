'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopNav: React.FC = () => {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Dashboard', icon: '🏠', href: '/dashboard/student', id: 'home' },
    { label: 'Courses', icon: '📚', href: '/dashboard/student/courses', id: 'courses' },
    { label: 'AI Chat', icon: '💬', href: '/dashboard/student/chat', id: 'chat' },
    { label: 'Voice Chat', icon: '🎤', href: '/dashboard/student/voice-chat', id: 'voice-chat' },
    { label: 'Profile', icon: '👤', href: '/dashboard/student/profile', id: 'profile' },
  ];

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black">🎓 ALIA</h1>
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
