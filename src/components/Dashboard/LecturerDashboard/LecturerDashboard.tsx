'use client';

import React, { useState } from 'react';
import { CourseManagement } from './CourseManagement';
import { StudentProgress } from './StudentProgress';
import { NotificationCenter } from './NotificationCenter';
import { ClassDemographics } from './ClassDemographics';
import { AlertSystem } from './AlertSystem';

import { CourseBuilder } from './CourseBuilder';
import { PerformanceMetrics } from './PerformanceMetrics';
import { authService } from '@/services/api/authService';
import { useRouter } from 'next/navigation';

type TabType = 'courses' | 'builder' | 'progress' | 'performance' | 'notifications' | 'demographics' | 'alerts';

export const LecturerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('builder');
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await authService.logout();
      window.location.href = '/login';
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'builder', label: 'Course Builder', icon: '🛠️' },
    { id: 'progress', label: 'Student Progress', icon: '📈' },
    { id: 'performance', label: 'Performance Analytics', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '📢' },
    { id: 'demographics', label: 'Class Insights', icon: '👥' },
    { id: 'alerts', label: 'Alerts', icon: '🔔' },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen soft-gradient-bg overflow-x-hidden">
      <header className="sticky top-0 z-40 glass-nav border-b border-white/40 shadow-xl shadow-slate-950/5">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center"
                aria-label="Open lecturer menu"
              >
                ☰
              </button>
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm p-2 overflow-hidden">
                <img src="/logo-icon.png" alt="ALIA Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                Lecturer <span className="alia-gradient-text">Hub</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-xs mt-1 wrap-break-word">
              Course Management • <span className="text-blue-600">Teaching Excellence</span>
            </p>
          </div>

          <div className="glass-card w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center sm:justify-start gap-2 sm:gap-3 border-blue-100 shadow-xl shadow-blue-500/5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[9px] sm:text-xs font-black text-slate-900 uppercase tracking-widest text-center sm:text-left">Teaching Mode: Active</span>
          </div>
        </div>

        <div className="lg:hidden border-t border-white/40 px-4 sm:px-6 py-2">
          <p className="text-[11px] font-bold text-slate-600 truncate">
            {activeTabData?.icon} {activeTabData?.label}
          </p>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close lecturer menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-900">Lecturer Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600"
                aria-label="Close lecturer menu"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all font-bold text-sm tracking-wide"
                >
                  <span className="text-base">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}

      <main className="max-w-400 mx-auto w-full px-3 sm:px-6 lg:px-10 py-5 sm:py-8 opacity-0 animate-[fade-in-only_0.5s_ease-out_forwards]">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-4">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] px-3 pb-2">
                Lecturer Navigation
              </p>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                  </button>
                ))}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-all font-bold text-sm tracking-wide"
                  >
                    <span className="text-base">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="glass-card rounded-4xl p-5 sm:p-8 lg:p-10 border-white shadow-2xl shadow-slate-900/5 min-h-150">
              <div className="mb-6 pb-4 border-b border-slate-200/60">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>{activeTabData?.icon}</span>
                  <span>{activeTabData?.label}</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">Access your tools and teaching workflows from this section.</p>
              </div>

              {activeTab === 'courses' && <CourseManagement onEditCourse={handleEditCourse} />}
              {activeTab === 'builder' && <CourseBuilder initialCourseId={selectedCourseId} />}
              {activeTab === 'progress' && <StudentProgress />}
              {activeTab === 'performance' && <PerformanceMetrics />}
              {activeTab === 'notifications' && <NotificationCenter />}
              {activeTab === 'demographics' && <ClassDemographics />}
              {activeTab === 'alerts' && <AlertSystem />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
