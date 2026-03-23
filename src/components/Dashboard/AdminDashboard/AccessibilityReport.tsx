'use client';

import React, { useState, useEffect } from 'react';
import { adminService, AccessibilityReport as AccessibilityReportData } from '@/services/api/adminService';

export const AccessibilityReport: React.FC = () => {
  const [report, setReport] = useState<AccessibilityReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccessibilityReport();
  }, []);

  const loadAccessibilityReport = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAccessibilityReport();
      setReport(data);
    } catch (err) {
      setError('Failed to load accessibility report');
      console.error('Error loading accessibility report:', err);
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

  if (error || !report) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        {error || 'No accessibility report data available'}
      </div>
    );
  }

  const totalFeatureUsage = Object.values(report.feature_usage).reduce((sum, count) => sum + count, 0);

  const accessibilityMetrics = [
    {
      feature: 'Bionic Reading',
      usage: report.feature_usage.bionic_reading,
      percentage: totalFeatureUsage > 0 ? (report.feature_usage.bionic_reading / totalFeatureUsage * 100) : 0,
      icon: '📖'
    },
    {
      feature: 'Voice Navigation',
      usage: report.feature_usage.voice_navigation,
      percentage: totalFeatureUsage > 0 ? (report.feature_usage.voice_navigation / totalFeatureUsage * 100) : 0,
      icon: '🎤'
    },
    {
      feature: 'High Contrast',
      usage: report.feature_usage.high_contrast,
      percentage: totalFeatureUsage > 0 ? (report.feature_usage.high_contrast / totalFeatureUsage * 100) : 0,
      icon: '🌓'
    },
    {
      feature: 'Screen Reader',
      usage: report.feature_usage.screen_reader,
      percentage: totalFeatureUsage > 0 ? (report.feature_usage.screen_reader / totalFeatureUsage * 100) : 0,
      icon: '🔊'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-[32px] p-8 border-white/60 hover-lift shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Users with Disabilities</p>
            <span className="text-2xl group-hover:scale-125 transition-transform">🛡️</span>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">{report.total_users_with_disabilities}</p>
          <p className="text-xs font-bold text-slate-500 mt-2">Protected by accessibility features</p>
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-blue-500/10 group-hover:bg-blue-500 transition-colors duration-500" />
        </div>

        <div className="glass-card rounded-[32px] p-8 border-white/60 hover-lift shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Total Feature Usage</p>
            <span className="text-2xl group-hover:scale-125 transition-transform">🔋</span>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalFeatureUsage}</p>
          <p className="text-xs font-bold text-slate-500 mt-2">Active accessibility sessions</p>
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-green-500/10 group-hover:bg-green-500 transition-colors duration-500" />
        </div>

        <div className="glass-card rounded-[32px] p-8 border-white/60 hover-lift shadow-2xl shadow-slate-900/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Pending Requests</p>
            <span className="text-2xl group-hover:scale-125 transition-transform">📋</span>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">
            {report.accommodation_requests.filter(r => r.status === 'pending').length}
          </p>
          <p className="text-xs font-bold text-slate-500 mt-2">Accommodation requests</p>
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-purple-500/10 group-hover:bg-purple-500 transition-colors duration-500" />
        </div>
      </div>

      {/* Disability Types Distribution */}
      <div className="glass-card rounded-[32px] p-10 border-white/60 shadow-2xl shadow-slate-900/5">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
          <span className="w-2 h-8 bg-slate-900 rounded-full" />
          Disability Types Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {report.by_disability_type.map((disability, index) => {
            const colors = ['bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-green-100 text-green-800', 'bg-blue-100 text-blue-800'];
            const colorClass = colors[index % colors.length];
            const percentage = report.total_users_with_disabilities > 0 ? 
              Math.round((disability.count / report.total_users_with_disabilities) * 100) : 0;
            
            return (
              <div key={disability.type} className={`${colorClass} px-6 py-4 rounded-2xl text-center`}>
                <div className="font-black text-2xl">{disability.count}</div>
                <div className="text-sm capitalize font-medium">{disability.type}</div>
                <div className="text-xs opacity-75">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Usage Metrics */}
      <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-900/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase tracking-[0.2em] text-[10px] font-black">
              <th className="px-10 py-8">Accessibility Feature</th>
              <th className="px-6 py-8 text-center">Active Users</th>
              <th className="px-6 py-8 text-center">Usage %</th>
              <th className="px-10 py-8 text-right">Feature Icon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {accessibilityMetrics.map((metric) => (
              <tr key={metric.feature} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-10 py-8">
                  <p className="font-black text-slate-900 text-lg">{metric.feature}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 group-hover:text-blue-600 transition-colors">
                    Enabled platform-wide
                  </p>
                </td>
                <td className="px-6 py-8 text-center font-black text-slate-900 text-xl">
                  {metric.usage}
                  <span className="text-xs text-slate-400 ml-1">users</span>
                </td>
                <td className="px-6 py-8 text-center font-black text-slate-900">
                  {metric.percentage.toFixed(1)}%
                </td>
                <td className="px-10 py-8 text-right text-2xl group-hover:scale-125 transition-transform">
                  {metric.icon}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Accommodation Requests */}
      {report.accommodation_requests.length > 0 && (
        <div className="glass-card rounded-[32px] p-10 border-white/60 shadow-2xl shadow-slate-900/5">
          <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
            <span className="w-2 h-8 bg-orange-500 rounded-full" />
            Accommodation Requests
          </h3>
          <div className="space-y-4">
            {report.accommodation_requests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-sm">{request.full_name}</p>
                  <p className="text-slate-500 font-bold text-xs capitalize">
                    {request.disability_type} • {request.accommodations_needed.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="glass-card rounded-[40px] p-10 border-blue-100 bg-blue-50/20 shadow-2xl shadow-blue-500/5">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
          <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">🧠</span>
          Accessibility Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
            <span className="text-green-500 font-black">✓</span>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              {report.total_users_with_disabilities} students are actively using accessibility features ({((report.total_users_with_disabilities / (report.total_users_with_disabilities + totalFeatureUsage)) * 100).toFixed(1)}% of platform users)
            </p>
          </div>
          <div className="flex gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
            <span className="text-blue-500 font-black">ℹ️</span>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Most popular feature: {accessibilityMetrics.reduce((max, metric) => metric.usage > max.usage ? metric : max, accessibilityMetrics[0]).feature} with {accessibilityMetrics.reduce((max, metric) => metric.usage > max.usage ? metric : max, accessibilityMetrics[0]).usage} active users
            </p>
          </div>
          {report.accommodation_requests.filter(r => r.status === 'pending').length > 0 && (
            <div className="flex gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
              <span className="text-orange-500 font-black">⚠️</span>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                {report.accommodation_requests.filter(r => r.status === 'pending').length} accommodation requests require immediate attention
              </p>
            </div>
          )}
          <div className="flex gap-4 p-4 bg-white/40 rounded-2xl border border-white/60">
            <span className="text-purple-500 font-black">📈</span>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              Consider expanding accessibility features based on current usage patterns and user feedback
            </p>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex flex-wrap gap-4 pt-4">
        <button 
          onClick={loadAccessibilityReport}
          className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-all hover-lift active:scale-95 flex items-center gap-3"
        >
          <span>🔄</span> Refresh Report
        </button>
        <button className="bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover-lift">
          📄 Export PDF
        </button>
        <button className="bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all hover-lift">
          📊 Export CSV
        </button>
      </div>
    </div>
  );
};
