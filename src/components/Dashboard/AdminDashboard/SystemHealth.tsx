'use client';

import React, { useState, useEffect } from 'react';
import { adminService, SystemHealth as SystemHealthData, SystemStatistics } from '@/services/api/adminService';

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [healthData, statsData] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemStatistics()
      ]);
      setHealth(healthData);
      setStatistics(statsData);
    } catch (err) {
      setError('Failed to load system data');
      console.error('Error loading system data:', err);
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

  if (error || !health || !statistics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        {error || 'No system data available'}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'down':
      case 'disconnected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const healthMetrics = [
    {
      label: 'Active Students',
      value: statistics.users.active,
      status: 'healthy',
      icon: '👨‍🎓',
    },
    {
      label: 'Total Courses',
      value: statistics.courses.total,
      status: 'healthy',
      icon: '📚',
    },
    {
      label: 'Total Enrollments',
      value: statistics.enrollments.total,
      status: 'healthy',
      icon: '📝',
    },
    {
      label: 'System Uptime',
      value: `${health.uptime}%`,
      status: health.uptime > 99 ? 'healthy' : health.uptime > 95 ? 'warning' : 'critical',
      icon: '✅',
    },
    {
      label: 'Database Response',
      value: `${health.database.response_time}ms`,
      status: health.database.status === 'connected' ? 'healthy' : 'critical',
      icon: '💾',
    },
    {
      label: 'Storage Usage',
      value: `${health.storage.percentage}%`,
      status: health.storage.percentage < 80 ? 'healthy' : health.storage.percentage < 90 ? 'warning' : 'critical',
      icon: '💿',
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[32px] border border-slate-200 shadow-inner">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Vitality Engine</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Real-time infrastructure synchronization</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusBadge(health.status)}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              health.status === 'healthy' ? 'bg-green-500' : 
              health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {health.status} Status
          </div>
          <button 
            onClick={loadSystemData}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {healthMetrics.map((metric) => (
          <div
            key={metric.label}
            className={`glass-card rounded-[32px] p-8 border-white/60 hover-lift relative overflow-hidden group ${
              metric.status === 'warning' ? 'ring-2 ring-yellow-500/20' :
              metric.status === 'critical' ? 'ring-2 ring-red-500/20' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {metric.icon}
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                metric.status === 'healthy' ? 'bg-green-100 text-green-700' :
                metric.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {metric.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
              <p className="text-3xl font-black text-slate-900">{metric.value}</p>
            </div>

            {/* Background Glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-colors ${
              metric.status === 'healthy' ? 'bg-green-500' :
              metric.status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
          </div>
        ))}
      </div>

      {/* API Performance Alert */}
      {health.api.error_rate > 1 && (
        <div className="glass-card rounded-[40px] p-10 border-red-200 bg-red-50/20 shadow-2xl shadow-red-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 text-6xl opacity-10 rotate-12">⚠️</div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="text-red-600">🚨</span> High Error Rate Detected
              </h3>
              <p className="text-slate-600 font-bold max-w-xl">
                API error rate is at <span className="text-red-600 text-lg">{health.api.error_rate}%</span>.
                Average response time: <span className="text-red-600">{health.api.average_response_time}ms</span>.
                Immediate attention required.
              </p>
            </div>
            <button className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover-lift">
              Investigate Issues
            </button>
          </div>
        </div>
      )}

      {/* Storage Warning */}
      {health.storage.percentage > 80 && (
        <div className="glass-card rounded-[40px] p-10 border-yellow-200 bg-yellow-50/20 shadow-2xl shadow-yellow-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 text-6xl opacity-10 rotate-12">💾</div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="text-yellow-600">⚡</span> Storage Usage Alert
              </h3>
              <p className="text-slate-600 font-bold max-w-xl">
                Storage usage is at <span className="text-yellow-600 text-lg">{health.storage.percentage}%</span>.
                Used: {Math.round(health.storage.used / (1024 * 1024 * 1024))} GB of {Math.round(health.storage.total / (1024 * 1024 * 1024))} GB.
                Consider cleanup or expansion.
              </p>
            </div>
            <button className="bg-yellow-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-yellow-600/20 hover:bg-yellow-700 transition-all hover-lift">
              Manage Storage
            </button>
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {health.recent_errors.length > 0 && (
        <div className="glass-card rounded-[40px] p-10 border-white/60">
          <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
            <span className="w-2 h-8 bg-red-500 rounded-full" />
            Recent System Errors
          </h3>
          <div className="grid gap-4">
            {health.recent_errors.map((error, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-red-50/50 rounded-2xl border border-red-100 hover:bg-red-50 hover:shadow-xl transition-all group">
                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black">
                  ⚠️
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-sm tracking-tight">{error.error}</p>
                  <p className="text-slate-500 font-bold text-xs">
                    {new Date(error.timestamp).toLocaleString()} • Count: {error.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Performance Metrics */}
      <div className="glass-card rounded-[40px] p-10 border-white/60">
        <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
          <span className="w-2 h-8 bg-slate-900 rounded-full" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="text-2xl font-black text-slate-900">{health.api.requests_per_minute}</div>
            <div className="text-sm font-medium text-slate-600">Requests/Minute</div>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="text-2xl font-black text-slate-900">{health.api.average_response_time}ms</div>
            <div className="text-sm font-medium text-slate-600">Avg Response Time</div>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <div className="text-2xl font-black text-slate-900">{statistics.engagement.daily_active_users}</div>
            <div className="text-sm font-medium text-slate-600">Daily Active Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};
