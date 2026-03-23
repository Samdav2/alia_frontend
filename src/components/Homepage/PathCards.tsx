'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Settings, CheckCircle2, ArrowUpRight } from 'lucide-react';

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
    <section id="path" className="py-24 sm:py-32 px-4 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full mb-8 border-blue-100/50"
          >
            <span className="text-sm font-black bg-blue-600 bg-clip-text text-transparent uppercase tracking-[0.2em]">Tailored Experiences</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black text-slate-900 mb-8 tracking-tight"
          >
            Choose Your <span className="alia-gradient-text">Journey</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-slate-600 max-w-2xl mx-auto font-medium"
          >
            Whether you're a student, educator, or administrator, ALIA adapts to your unique workflow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {PATHS.map((path, idx) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={path.href} className="group block h-full">
                <div
                  className={`relative h-full glass-card rounded-[40px] p-10 lg:p-12 border-white/80 hover-lift transition-all duration-500 overflow-hidden ${idx === 1 ? 'ring-2 ring-blue-500/20 shadow-blue-500/5 bg-white/90' : 'bg-white/70'
                    }`}
                >
                  {/* Hover background effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${path.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl -mr-16 -mt-16`} />

                  {/* Icon Container */}
                  <div className="relative mb-12">
                    <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ring-8 ring-white/50`}>
                      {path.id === 'student' ? <GraduationCap className="w-12 h-12 text-white" /> :
                        path.id === 'lecturer' ? <BookOpen className="w-12 h-12 text-white" /> :
                          <Settings className="w-12 h-12 text-white" />}
                    </div>
                    {path.id === 'lecturer' && (
                      <div className="absolute -top-4 -right-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl">
                        AI Co-Pilot
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {path.title}
                      </h3>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    <p className="text-xl text-slate-600 font-medium leading-relaxed">
                      {path.description}
                    </p>

                    <div className="pt-8 grid grid-cols-1 gap-4">
                      {path.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-700">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="pt-10 flex items-center gap-4 text-blue-600 font-black text-lg">
                      <span>Enter Interface</span>
                      <div className="h-0.5 w-0 bg-blue-600 group-hover:w-12 transition-all duration-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
