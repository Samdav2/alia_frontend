'use client';

import React from 'react';
import Link from 'next/link';
import { CourseGrid } from './CourseGrid';
import { RecommendedCourses } from './RecommendedCourses';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { AutonomousAgentPanel } from './AutonomousAgentPanel';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { NotificationTest } from '@/components/Accessibility/NotificationTest';

interface LandingViewProps {
  studentName: string;
  studentId: string;
  department: string;
}

export const LandingView: React.FC<LandingViewProps> = ({
  studentName,
  studentId,
  department,
}) => {
  const { isAutoPilotActive } = useUserPreferences();
  
  // Enable keyboard navigation
  useKeyboardNavigation();

  return (
    <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 lg:space-y-16">
        <PersonalizedGreeting />

        {/* Autonomous Agent Control Panel */}
        <AutonomousAgentPanel />

        {/* Agentic Mode Hero CTA */}
        {isAutoPilotActive && (
          <div className="glass-card rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 border-blue-100 bg-slate-900 shadow-2xl overflow-hidden relative group animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Neural Link Active</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Autonomous Learning <span className="text-blue-400">In Progress</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-400 font-bold max-w-xl">
                  ALIA is navigating your curriculum autonomously. Sit back and let the agent handle course selection and progression.
                </p>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My <span className="text-blue-600">Courses</span>
            </h2>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Link href="/dashboard/student/metrics" className="text-xs sm:text-sm font-black text-purple-600 uppercase tracking-widest hover:underline whitespace-nowrap">
                📊 Metrics
              </Link>
              <Link href="/dashboard/student/profile" className="text-xs sm:text-sm font-black text-green-600 uppercase tracking-widest hover:underline whitespace-nowrap">
                👤 Profile
              </Link>
              <button className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap hidden sm:inline">
                View All
              </button>
            </div>
          </div>
          <CourseGrid />
        </section>

        <section className="pb-12 lg:pb-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg flex-shrink-0">
              ✨
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                AI Recommendations
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-wide">
                Tailored for {department} Students
              </p>
            </div>
          </div>
          <RecommendedCourses department={department} />
        </section>
      </div>
      
      {/* Test Notifications - Development Tool */}
      <NotificationTest />
    </div>
  );
};
