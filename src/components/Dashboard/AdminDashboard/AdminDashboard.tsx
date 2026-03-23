'use client';

import React, { useState } from 'react';
import { DashboardOverview } from './DashboardOverview';
import { SystemHealth } from './SystemHealth';
import { UserManagement } from './UserManagement';
import { AccessibilityReport } from './AccessibilityReport';
import { CourseManagement } from './CourseManagement';
import { AnnouncementManagement } from './AnnouncementManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { AuditLogs } from './AuditLogs';

type TabType = 'overview' | 'health' | 'users' | 'courses' | 'departments' | 'announcements' | 'accessibility' | 'audit';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

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

  return (
    <div className="min-h-screen soft-gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-white/40 shadow-xl shadow-slate-950/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                A
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Neural <span className="alia-gradient-text">Oversight</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              System Admin • <span className="text-blue-600">Architect Platform</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border-blue-100 shadow-xl shadow-blue-500/5">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Platform Integrity: 100%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex gap-2 sm:gap-6 overflow-x-auto pb-px no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-3 font-black uppercase tracking-widest text-[9px] sm:text-xs transition-all border-b-4 shrink-0 ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-900'
                  }`}
              >
                <span className="text-sm sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16 animate-fade-in">
        <div className="glass-card rounded-[40px] p-8 sm:p-12 border-white shadow-2xl shadow-slate-900/5 min-h-[600px]">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'health' && <SystemHealth />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'departments' && <DepartmentManagement />}
          {activeTab === 'announcements' && <AnnouncementManagement />}
          {activeTab === 'accessibility' && <AccessibilityReport />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
};
