'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav: React.FC = () => {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: 'Home', icon: '🏠', href: '/dashboard/student', id: 'home' },
        { label: 'Courses', icon: '📚', href: '/dashboard/student/courses', id: 'courses' },
        { label: 'AI Chat', icon: '💬', href: '/dashboard/student/chat', id: 'chat' },
        { label: 'Voice', icon: '🎤', href: '/dashboard/student/voice-chat', id: 'voice-chat' },
        { label: 'Profile', icon: '👤', href: '/dashboard/student/profile', id: 'profile' },
    ];

    return (
        <nav className="lg:hidden fixed bottom-6 left-2 right-2 z-50">
            <div className="glass-nav rounded-3xl p-1.5 flex justify-around items-center shadow-2xl border-white/40 ring-1 ring-slate-900/5 overflow-x-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all flex-shrink-0 min-w-[60px] sm:min-w-[70px] ${isActive
                                    ? 'bg-slate-900 text-white shadow-lg scale-105 sm:scale-110'
                                    : 'text-slate-500 hover:bg-slate-100 active:scale-95'
                                }`}
                        >
                            <span className="text-lg sm:text-2xl">{item.icon}</span>
                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter text-center leading-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
