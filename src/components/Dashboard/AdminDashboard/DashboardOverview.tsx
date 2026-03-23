'use client';

import React, { useState, useEffect } from 'react';
import { adminService, SystemStatistics } from '@/services/api/adminService';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Unable to load statistics</h3>
        <p className="text-slate-600">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl font-black text-blue-600 mb-2">{stats.users.total}</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Users</div>
            <div className="text-xs text-green-600 mt-1">
              +{stats.users.new_this_month} this month
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl font-black text-green-600 mb-2">{stats.users.active}</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Active Users</div>
            <div className="text-xs text-slate-500 mt-1">
              {Math.round((stats.users.active / stats.users.total) * 100)}% of total
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl font-black text-purple-600 mb-2">{stats.courses.total}</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Courses</div>
            <div className="text-xs text-blue-600 mt-1">
              {stats.courses.active} active
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl font-black text-orange-600 mb-2">{stats.enrollments.total}</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Enrollments</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.enrollments.completed} completed
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-black text-indigo-600 mb-2">{stats.engagement.daily_active_users}</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Daily Active Users</div>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-black text-teal-600 mb-2">{stats.engagement.average_session_time}m</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Avg Session Time</div>
          </div>

          <div className="glass-card p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
            <div className="text-3xl font-black text-pink-600 mb-2">{stats.engagement.total_learning_hours}h</div>
            <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Learning Hours</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-left">
            <div className="text-2xl mb-3">👤</div>
            <div className="font-bold text-slate-900 mb-1">Create User</div>
            <div className="text-sm text-slate-600">Add new user account</div>
          </button>

          <button className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-left">
            <div className="text-2xl mb-3">📚</div>
            <div className="font-bold text-slate-900 mb-1">Review Courses</div>
            <div className="text-sm text-slate-600">Approve pending courses</div>
          </button>

          <button className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-left">
            <div className="text-2xl mb-3">📢</div>
            <div className="font-bold text-slate-900 mb-1">Send Announcement</div>
            <div className="text-sm text-slate-600">Notify all users</div>
          </button>

          <button className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-left">
            <div className="text-2xl mb-3">📊</div>
            <div className="font-bold text-slate-900 mb-1">View Reports</div>
            <div className="text-sm text-slate-600">System analytics</div>
          </button>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">●</span>
              System Health
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">API Response Time</span>
                <span className="text-sm font-bold text-green-600">&lt; 200ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Database Status</span>
                <span className="text-sm font-bold text-green-600">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Error Rate</span>
                <span className="text-sm font-bold text-green-600">0.1%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">●</span>
              Platform Activity
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">New Registrations Today</span>
                <span className="text-sm font-bold text-blue-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Courses Created This Week</span>
                <span className="text-sm font-bold text-blue-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Support Tickets Open</span>
                <span className="text-sm font-bold text-yellow-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
