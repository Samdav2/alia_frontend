'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { courseService, Course } from '@/services/api/courseService';
import { enrollmentAPIService } from '@/services/api/enrollmentService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

export const CourseMarketplace: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [enrollments, setEnrollments] = useState<Record<string, boolean>>({});
  const [enrolling, setEnrolling] = useState<Record<string, boolean>>({});
  const { showNotification } = useVisualNotification();

  // Load courses from API
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses({
        page: 1,
        limit: 50 // Load more courses for marketplace
      });
      setCourses(data.courses);
      
      // Use enrollment status from API response instead of separate calls
      const enrollmentStatus: Record<string, boolean> = {};
      for (const course of data.courses) {
        enrollmentStatus[course.id] = course.is_enrolled || false;
      }
      setEnrollments(enrollmentStatus);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (courseId: string, courseTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (enrolling[courseId]) return;
    
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      
      // Try API enrollment first
      try {
        await enrollmentAPIService.enrollInCourse(courseId);
        setEnrollments(prev => ({ ...prev, [courseId]: true }));
        showNotification(`Successfully enrolled in ${courseTitle}! 🎉`, 'success');
        textToSpeechService.announce(`You have successfully enrolled in ${courseTitle}. You can now start learning!`);
        
        // Reload courses to get updated enrollment status
        loadCourses();
      } catch (apiError) {
        throw new Error('Enrollment failed');
      }
    } catch (err) {
      showNotification('Enrollment failed. Please try again.', 'error');
      textToSpeechService.announce('Enrollment failed. Please try again.');
      console.error('Enrollment error:', err);
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Extract unique values for filters
  const departments = useMemo(() => {
    const unique = Array.from(new Set(courses.map(c => c.department))).sort();
    return ['all', ...unique];
  }, [courses]);

  const levels = useMemo(() => {
    const unique = Array.from(new Set(courses.map(c => c.level))).sort();
    return ['all', ...unique];
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      return matchesSearch && matchesDepartment && matchesLevel;
    });

    // Sort
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [courses, searchQuery, selectedDepartment, selectedLevel, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-medium">{error}</p>
            <button 
              onClick={loadCourses}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student" className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
              <span>←</span> Dashboard
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Course <span className="text-blue-600">Marketplace</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-bold mt-2">
              Discover and enroll in courses across all departments
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/60">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by name, code, or description..."
                className="w-full bg-white/60 border border-white/80 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg sm:text-xl">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">Filters</h3>
            <button
              onClick={() => {
                setSelectedDepartment('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-white/60 border border-white/80 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-white/60 border border-white/80 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white/60 border border-white/80 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm sm:text-base font-bold text-slate-600">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map(course => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group">
              <div className="glass-card rounded-[20px] sm:rounded-[32px] p-6 sm:p-8 hover-lift border-white/60 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-105 transition-transform">
                  {course.thumbnail || '📚'}
                </div>

                {/* Course Info */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                      {course.code}
                    </span>
                    {course.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs font-bold text-slate-600">{course.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                      <span>👤</span>
                      <span className="truncate">{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                      <span>🏛️</span>
                      <span className="truncate">{course.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{course.enrollment_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {course.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enroll Button */}
                <div className="mt-4 sm:mt-6 flex gap-2">
                  <Link 
                    href={`/courses/${course.id}`}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all hover-lift text-center"
                  >
                    View Course →
                  </Link>
                  {enrollments[course.id] ? (
                    <div className="px-4 py-3 bg-green-100 text-green-700 rounded-xl font-bold text-sm border-2 border-green-200 flex items-center gap-2">
                      <span>✓</span>
                      <span>Enrolled</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleEnrollment(course.id, course.title, e)}
                      disabled={enrolling[course.id]}
                      className="px-4 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling[course.id] ? '...' : 'Enroll'}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="glass-card rounded-[32px] p-12 sm:p-16 text-center border-white/60">
            <div className="text-6xl sm:text-7xl mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              No courses found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSelectedDepartment('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all hover-lift"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
