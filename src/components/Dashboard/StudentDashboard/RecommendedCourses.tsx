'use client';

import React from 'react';
import Link from 'next/link';

interface RecommendedCourse {
  id: string;
  code: string;
  title: string;
  reason: string;
}

interface RecommendedCoursesProps {
  department: string;
}

// Mock data - replace with API call
const RECOMMENDED_BY_DEPARTMENT: Record<string, RecommendedCourse[]> = {
  Education: [
    {
      id: '4',
      code: 'EDU 501',
      title: 'Advanced Pedagogy',
      reason: 'Recommended for your department',
    },
    {
      id: '5',
      code: 'EDU 502',
      title: 'Assessment Strategies',
      reason: 'Popular in Education',
    },
  ],
  Engineering: [
    {
      id: '6',
      code: 'ENG 301',
      title: 'Systems Design',
      reason: 'Recommended for your department',
    },
  ],
};

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({
  department,
}) => {
  const courses = RECOMMENDED_BY_DEPARTMENT[department] || [];

  if (courses.length === 0) {
    return (
      <div className="glass-card rounded-[20px] sm:rounded-[32px] p-8 sm:p-12 text-center border-white/60">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs sm:text-sm">No adaptive paths detected yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
      {courses.map((course) => (
        <Link key={course.id} href={`/courses/${course.id}`} className="group">
          <div className="glass-card rounded-[20px] sm:rounded-[32px] p-6 sm:p-8 hover-lift border-white/60 relative overflow-hidden group-hover:ring-2 ring-purple-500/20 transition-all">
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="px-2 sm:px-3 py-1 bg-purple-50 rounded-full text-[9px] sm:text-[10px] font-black text-purple-600 uppercase tracking-widest">
                Neuro-Matching
              </div>
              <div className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">✨</div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{course.code}</p>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  {course.title}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {course.reason}
              </p>

              <div className="pt-4 sm:pt-6 flex items-center gap-2 sm:gap-3 text-purple-600 font-black group-hover:gap-4 sm:group-hover:gap-5 transition-all text-sm sm:text-base">
                <span>Start Path</span>
                <span className="text-lg sm:text-xl">→</span>
              </div>
            </div>

            {/* Background Blur Accent */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
};
