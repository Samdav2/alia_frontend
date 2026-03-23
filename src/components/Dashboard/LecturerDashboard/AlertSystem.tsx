'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, Alert } from '@/services/api/lecturerService';

const getSeverityColor = (severity: Alert['severity']) => {
  switch (severity) {
    case 'high':
      return 'border-red-500 bg-red-50';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50';
    case 'low':
      return 'border-blue-500 bg-blue-50';
  }
};

const getSeverityIcon = (severity: Alert['severity']) => {
  switch (severity) {
    case 'high':
      return '🚨';
    case 'medium':
      return '⚠️';
    case 'low':
      return 'ℹ️';
  }
};

const getAlertTypeIcon = (type: Alert['type']) => {
  switch (type) {
    case 'struggling_student':
      return '📉';
    case 'inactive_student':
      return '😴';
    case 'low_score':
      return '📊';
    default:
      return '🔔';
  }
};

export const AlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (alert: Alert) => {
    try {
      setSendingNotification(alert.id);

      let message = '';
      let title = '';

      switch (alert.type) {
        case 'struggling_student':
          title = 'We\'re Here to Help!';
          message = 'We noticed you might need some assistance. Don\'t hesitate to reach out if you have questions.';
          break;
        case 'inactive_student':
          title = 'We Miss You!';
          message = 'We noticed you haven\'t been active recently. Is there anything we can help you with?';
          break;
        case 'low_score':
          title = 'Let\'s Improve Together';
          message = 'We saw your recent quiz results. Would you like some additional resources or study tips?';
          break;
        default:
          title = 'Course Update';
          message = 'We have some important information for you regarding your course progress.';
      }

      await lecturerService.sendNotification({
        course_id: alert.course.id,
        recipient_type: 'specific',
        student_ids: [alert.student.id],
        title,
        message,
        type: 'reminder'
      });

      // Remove the alert from the list after sending notification
      setAlerts(alerts.filter(a => a.id !== alert.id));
    } catch (err) {
      setError('Failed to send notification');
      console.error('Error sending notification:', err);
    } finally {
      setSendingNotification(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-inner">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Agentic Alerts</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Real-time system interventions required</p>
        </div>
        <button
          onClick={loadAlerts}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all"
        >
          Rescan Network
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-lg p-6 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-lg">
                    {getSeverityIcon(alert.severity)}
                  </span>
                  <span className="text-3xl sm:text-4xl filter drop-shadow-lg">
                    {getAlertTypeIcon(alert.type)}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                    {alert.student.full_name} <span className="text-slate-300 mx-2">•</span> {alert.course.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">{alert.message}</p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-white/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      👤 {alert.student.full_name}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-white/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      📚 {alert.course.title}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full border border-white/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      🕐 {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleSendNotification(alert)}
                disabled={sendingNotification === alert.id}
                className="w-full xl:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50 hover-lift"
              >
                {sendingNotification === alert.id ? 'Synchronizing...' : 'Deploy Intervention'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && !loading && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded text-center">
          <p className="text-green-900 font-medium">✓ All clear! No alerts at this time.</p>
        </div>
      )}
    </div>
  );
};
