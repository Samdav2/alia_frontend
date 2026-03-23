'use client';

import React, { useState } from 'react';
import { CourseManagement } from './CourseManagement';
import { StudentProgress } from './StudentProgress';
import { NotificationCenter } from './NotificationCenter';
import { ClassDemographics } from './ClassDemographics';
import { AlertSystem } from './AlertSystem';

import { CourseBuilder } from './CourseBuilder';
import { PerformanceMetrics } from './PerformanceMetrics';

type TabType = 'courses' | 'builder' | 'progress' | 'performance' | 'notifications' | 'demographics' | 'alerts';

export const LecturerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('builder');
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

  return (
    <div className="min-h-screen soft-gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-white/40 shadow-xl shadow-slate-950/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl">
                L
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Lecturer <span className="alia-gradient-text">Hub</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              Course Management • <span className="text-blue-600">Teaching Excellence</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border-blue-100 shadow-xl shadow-blue-500/5">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Teaching Mode: Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 border-t border-slate-100/50">
          <div className="flex gap-2 sm:gap-6 overflow-x-auto pb-px scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-3 py-6 px-1 sm:px-2 font-black uppercase tracking-widest text-[9px] sm:text-xs transition-all border-b-4 shrink-0 whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-900'
                  }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16 opacity-0 animate-[fade-in-only_0.5s_ease-out_forwards]">
        <div className="glass-card rounded-[40px] p-8 sm:p-12 border-white shadow-2xl shadow-slate-900/5 min-h-[600px]">
          {activeTab === 'courses' && <CourseManagement onEditCourse={handleEditCourse} />}
          {activeTab === 'builder' && <CourseBuilder initialCourseId={selectedCourseId} />}
          {activeTab === 'progress' && <StudentProgress />}
          {activeTab === 'performance' && <PerformanceMetrics />}
          {activeTab === 'notifications' && <NotificationCenter />}
          {activeTab === 'demographics' && <ClassDemographics />}
          {activeTab === 'alerts' && <AlertSystem />}
        </div>
      </main>
    </div>
  );
};
