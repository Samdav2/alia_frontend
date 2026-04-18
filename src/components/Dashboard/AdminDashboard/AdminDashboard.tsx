'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardOverview } from './DashboardOverview';
import { SystemHealth } from './SystemHealth';
import { UserManagement } from './UserManagement';
import { AccessibilityReport } from './AccessibilityReport';
import { CourseManagement } from './CourseManagement';
import { AnnouncementManagement } from './AnnouncementManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { AuditLogs } from './AuditLogs';
import { authService } from '@/services/api/authService';

type TabType = 'overview' | 'health' | 'users' | 'courses' | 'departments' | 'announcements' | 'accessibility' | 'audit';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'health', label: 'System Health', icon: '⚡' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'departments', label: 'Departments', icon: '🏛️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'accessibility', label: 'Accessibility', icon: '🛡️' },
    { id: 'audit', label: 'Audit Logs', icon: '📋' },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      window.location.href = '/login';
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen soft-gradient-bg overflow-x-hidden">
      <header className="sticky top-0 z-40 glass-nav border-b border-slate-200 shadow-xl shadow-slate-950/5">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center"
                aria-label="Open admin menu"
              >
                ☰
              </button>
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xl">
                A
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                Neural <span className="alia-gradient-text">Oversight</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">
              System Admin • <span className="text-blue-600">Architect Platform</span>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
            <div className="glass-card w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center sm:justify-start gap-3 border-blue-100 shadow-xl shadow-blue-500/5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest">Platform Integrity: 100%</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 sm:px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        <div className="lg:hidden border-t border-slate-200 px-4 sm:px-6 py-2">
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
            aria-label="Close admin menu overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-900">Admin Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg border border-slate-200 text-slate-600"
                aria-label="Close admin menu"
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
            </nav>
          </aside>
        </div>
      )}

      <main className="max-w-400 mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-4">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] px-3 pb-2">
                Admin Navigation
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
                <p className="text-slate-500 text-sm mt-1">Manage and monitor this section from your admin workspace.</p>
              </div>

              {activeTab === 'overview' && <DashboardOverview />}
              {activeTab === 'health' && <SystemHealth />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'courses' && <CourseManagement />}
              {activeTab === 'departments' && <DepartmentManagement />}
              {activeTab === 'announcements' && <AnnouncementManagement />}
              {activeTab === 'accessibility' && <AccessibilityReport />}
              {activeTab === 'audit' && <AuditLogs />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
