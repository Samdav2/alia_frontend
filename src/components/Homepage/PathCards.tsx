'use client';

import React from 'react';
import Link from 'next/link';

interface PathCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  href: string;
  gradient: string;
  features: string[];
}

const PATHS: PathCard[] = [
  {
    id: 'student',
    title: 'For Students',
    icon: '👨‍🎓',
    description:
      'Access personalized content, adaptive quizzes, and tools that match your unique learning style.',
    href: '/dashboard/student',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    features: ['Adaptive Learning', 'AI Tutoring', 'Progress Tracking'],
  },
  {
    id: 'lecturer',
    title: 'For Lecturers',
    icon: '👨‍🏫',
    description:
      'Upload materials once. Let our AI agents summarize, format, and track class comprehension automatically.',
    href: '/dashboard/lecturer',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    features: ['Auto-Grading', 'Analytics', 'Content AI'],
  },
  {
    id: 'admin',
    title: 'For Administrators',
    icon: '⚙️',
    description:
      'Monitor system health, manage faculty access, and view real-time inclusivity metrics.',
    href: '/dashboard/admin',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    features: ['System Health', 'User Management', 'Reports'],
  },
];

export const PathCards: React.FC = () => {
  return (
    <section id="path" className="py-24 sm:py-32 px-4 soft-gradient-bg relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6 border-blue-100">
            <span className="text-sm font-bold bg-blue-600 bg-clip-text text-transparent uppercase tracking-widest">User Roles</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Choose Your <span className="alia-gradient-text">Journey</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Whether you're a student, educator, or administrator, ALIA adapts to your unique workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {PATHS.map((path, idx) => (
            <Link key={path.id} href={path.href} className="group">
              <div
                className={`relative h-full glass-card rounded-[32px] p-8 sm:p-10 border-white/60 hover-lift ${idx === 1 ? 'ring-2 ring-blue-500/20' : ''
                  }`}
              >
                {/* Icon Circle */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-4xl mb-8 group-hover:rotate-6 transition-transform shadow-xl`}>
                  {path.icon}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {path.title}
                  </h3>

                  <p className="text-slate-600 font-medium leading-relaxed">
                    {path.description}
                  </p>

                  <div className="pt-6 space-y-3">
                    {path.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 flex items-center gap-3 text-blue-600 font-black group-hover:gap-5 transition-all">
                    <span>Explore Dashboard</span>
                    <span className="text-xl">→</span>
                  </div>
                </div>

                {idx === 1 && (
                  <div className="absolute top-6 right-6 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    AI Co-Pilot
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
