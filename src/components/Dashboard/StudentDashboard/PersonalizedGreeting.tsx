'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService, UserProfile } from '@/services/api/userService';
import { authService } from '@/services/api/authService';

export const PersonalizedGreeting: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Try to get user from API first
      try {
        const profile = await userService.getProfile();
        setUser(profile);
      } catch (apiError) {
        // Fallback to stored user data
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser as any);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
        <div className="space-y-1 sm:space-y-2 flex-1">
          <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="w-48 h-16 bg-slate-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
        <div className="space-y-1 sm:space-y-2 flex-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, <span className="alia-gradient-text">Student</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] sm:text-xs">
            Welcome to ALIA Learning Platform
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
      <div className="space-y-1 sm:space-y-2 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, <span className="alia-gradient-text">{user.full_name.split(' ')[0]}</span>
          </h1>
          {/* Edit Profile Icon - Always Visible */}
          <Link
            href="/dashboard/student/profile"
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-lg hover-lift border border-slate-200"
            title="Edit Profile"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
        </div>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px] sm:text-xs">
          {user.student_id && `Matric: ${user.student_id} • `}
          <span className="text-blue-600">{user.department}</span>
          {user.is_active && <span className="text-green-600 ml-2">• Active</span>}
        </p>
      </div>

      <div className="glass-card px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 border-blue-100 shadow-xl shadow-blue-500/5 hover-lift w-full sm:w-auto">
        <div className="relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl animate-float">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">ALIA Assist</p>
          <p className="text-xs sm:text-sm font-bold text-slate-900">Neural Sync: <span className="text-green-600 uppercase">Active</span></p>
        </div>
      </div>
    </div>
  );
};
