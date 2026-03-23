'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, ClassDemographics as ClassDemographicsData } from '@/services/api/lecturerService';

export const ClassDemographics: React.FC = () => {
  const [demographics, setDemographics] = useState<ClassDemographicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDemographics();
  }, []);

  const loadDemographics = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getClassDemographics();
      setDemographics(data);
    } catch (err) {
      setError('Failed to load class demographics');
      console.error('Error loading demographics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !demographics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Class Demographics</h2>
        </div>
        <div className="glass-card p-12 rounded-2xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No data available</h3>
          <p className="text-slate-600">{error || 'Demographics data will appear here once students enroll in your courses.'}</p>
        </div>
      </div>
    );
  }

  // Safe access to accessibility usage with fallbacks
  const accessibilityUsage = demographics.accessibility_usage || {
    bionic_reading: 0,
    voice_navigation: 0,
    high_contrast: 0
  };

  const totalAccessibilityUsers = accessibilityUsage.bionic_reading +
    accessibilityUsage.voice_navigation +
    accessibilityUsage.high_contrast;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Community Insights</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Understanding your students' learning needs and preferences</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 sm:mb-2">{demographics.total_students}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Total Human Assets</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-1 sm:mb-2">{totalAccessibilityUsers}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Sync Needs</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center col-span-2 md:col-span-1">
          <div className="text-2xl sm:text-3xl font-black text-green-600 mb-1 sm:mb-2">{demographics.by_department?.length || 0}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Domains</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Students by Department</h3>
          <div className="space-y-4">
            {demographics.by_department?.length > 0 ? (
              demographics.by_department.map((dept, index) => {
                const percentage = Math.round((dept.count / demographics.total_students) * 100);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                const color = colors[index % colors.length];

                return (
                  <div key={dept.department}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-700">{dept.department}</span>
                      <span className="font-bold text-slate-900">{dept.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`${color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">🏛️</div>
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Features Usage */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Accessibility Feature Usage</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-700">🔤 Bionic Reading</span>
                <span className="font-bold text-slate-900">{accessibilityUsage.bionic_reading}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${demographics.total_students > 0 ? (accessibilityUsage.bionic_reading / demographics.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-700">🎤 Voice Navigation</span>
                <span className="font-bold text-slate-900">{accessibilityUsage.voice_navigation}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${demographics.total_students > 0 ? (accessibilityUsage.voice_navigation / demographics.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-700">🌓 High Contrast</span>
                <span className="font-bold text-slate-900">{accessibilityUsage.high_contrast}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${demographics.total_students > 0 ? (accessibilityUsage.high_contrast / demographics.total_students) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disability Types */}
      {demographics.by_disability?.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Students by Disability Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demographics.by_disability.map((disability, index) => {
              const colors = ['bg-red-100 text-red-800 border-red-200', 'bg-yellow-100 text-yellow-800 border-yellow-200', 'bg-green-100 text-green-800 border-green-200', 'bg-blue-100 text-blue-800 border-blue-200'];
              const colorClass = colors[index % colors.length];

              return (
                <div key={disability.type} className={`${colorClass} px-4 py-3 rounded-lg text-center border`}>
                  <div className="font-bold text-lg">{disability.count}</div>
                  <div className="text-sm capitalize">{disability.type}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {totalAccessibilityUsers > 0 && (
        <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
          <h3 className="font-bold text-green-900 mb-3">💡 Teaching Recommendations</h3>
          <ul className="space-y-2 text-green-800 text-sm">
            {accessibilityUsage.voice_navigation > 0 && (
              <li>• {accessibilityUsage.voice_navigation} students use Voice Navigation - ensure all interactive elements are voice-accessible</li>
            )}
            {accessibilityUsage.bionic_reading > 0 && (
              <li>• {accessibilityUsage.bionic_reading} students use Bionic Reading - maintain clear text formatting and structure</li>
            )}
            {accessibilityUsage.high_contrast > 0 && (
              <li>• {accessibilityUsage.high_contrast} students use High Contrast - test your materials in different display modes</li>
            )}
            {demographics.by_disability?.length > 0 && (
              <li>• Consider providing alternative content formats for students with disabilities</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
