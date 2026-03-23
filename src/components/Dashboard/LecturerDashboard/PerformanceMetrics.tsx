'use client';

import React from 'react';

interface StudentPerformance {
  id: string;
  name: string;
  studentId: string;
  quizScore: number;
  timeSpent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const MOCK_PERFORMANCE: StudentPerformance[] = [
  {
    id: '1',
    name: 'Amiola Oluwademilade',
    studentId: '220194031',
    quizScore: 92,
    timeSpent: 45,
    status: 'excellent',
  },
  {
    id: '2',
    name: 'John Smith',
    studentId: '220194032',
    quizScore: 78,
    timeSpent: 30,
    status: 'good',
  },
  {
    id: '3',
    name: 'Jane Doe',
    studentId: '220194033',
    quizScore: 55,
    timeSpent: 12,
    status: 'critical',
  },
  {
    id: '4',
    name: 'Michael Brown',
    studentId: '220194034',
    quizScore: 68,
    timeSpent: 20,
    status: 'warning',
  },
];

const getStatusColor = (status: StudentPerformance['status']) => {
  switch (status) {
    case 'excellent':
      return 'bg-green-100 text-green-800';
    case 'good':
      return 'bg-blue-100 text-blue-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
  }
};

const getStatusLabel = (status: StudentPerformance['status']) => {
  switch (status) {
    case 'excellent':
      return '⭐ Excellent';
    case 'good':
      return '✓ Good';
    case 'warning':
      return '⚠ Warning';
    case 'critical':
      return '🚨 Critical';
  }
};

export const PerformanceMetrics: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-inner">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Neural Performance Heatmap</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Real-time student synchronization metrics</p>
        </div>
        <button className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all hover-lift active:scale-95">
          Export Intelligence Report
        </button>
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-900/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase tracking-[0.2em] text-[9px] sm:text-[10px] font-black">
              <th className="px-6 sm:px-10 py-6 sm:py-8">Human Asset</th>
              <th className="px-4 sm:px-6 py-6 sm:py-8">Neural ID</th>
              <th className="px-4 sm:px-6 py-6 sm:py-8">Aura Logic Score</th>
              <th className="px-4 sm:px-6 py-6 sm:py-8 text-center">Sync Status</th>
              <th className="px-6 sm:px-10 py-6 sm:py-8 text-right flex items-center justify-end gap-2 group cursor-help">
                ALIA Suggestion 💡
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {MOCK_PERFORMANCE.map((student) => (
              <tr key={student.id} className="group hover:bg-blue-50/30 transition-all">
                <td className="px-6 sm:px-10 py-6 sm:py-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-900 border-2 border-white shadow-xl flex-shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base sm:text-lg whitespace-nowrap">{student.name}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Connection</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-6 sm:py-8">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 font-mono">#{student.studentId}</span>
                </td>
                <td className="px-4 sm:px-6 py-6 sm:py-8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg sm:text-xl font-black text-slate-900">{student.quizScore}%</span>
                    </div>
                    <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2 sm:h-3 overflow-hidden ring-1 ring-slate-900/5">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${student.quizScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                  <div className={`inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${student.status === 'excellent' ? 'bg-green-100 text-green-700' :
                    student.status === 'good' ? 'bg-blue-100 text-blue-700' :
                      student.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {getStatusLabel(student.status)}
                  </div>
                </td>
                <td className="px-6 sm:px-10 py-6 sm:py-8 text-right">
                  <button className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-white rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all opacity-0 lg:group-hover:opacity-100 transform translate-x-4 lg:group-hover:translate-x-0">
                    Intervene
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
