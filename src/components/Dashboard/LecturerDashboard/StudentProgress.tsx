'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CourseEnrollment, StudentProgress as StudentProgressType, CourseAnalytics } from '@/services/api/lecturerService';
import { Course } from '@/services/api/courseService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

export const StudentProgress: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<CourseEnrollment | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgressType | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseData(selectedCourse.id);
    }
  }, [selectedCourse, filters]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getMyCourses({ page: 1, limit: 50 });
      setCourses(data.courses);
      if (data.courses.length > 0) {
        setSelectedCourse(data.courses[0]);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      setLoading(true);

      // Load enrollments
      const enrollmentParams: any = { page: 1, limit: 100 };
      if (filters.status !== 'all') enrollmentParams.status = filters.status;

      const [enrollmentData, analyticsData] = await Promise.all([
        lecturerService.getCourseEnrollments(courseId, enrollmentParams),
        lecturerService.getCourseAnalytics(courseId)
      ]);

      let filteredEnrollments = enrollmentData.enrollments;

      // Apply search filter
      if (filters.search) {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          enrollment.user.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setEnrollments(filteredEnrollments);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading course data:', err);
      showNotification('Failed to load course data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (courseId: string, studentId: string) => {
    try {
      const progress = await lecturerService.getStudentProgress(courseId, studentId);
      setStudentProgress(progress);
    } catch (err) {
      console.error('Error loading student progress:', err);
      showNotification('Failed to load student progress', 'error');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      dropped: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.active}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading && courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Student Progress</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Student Success Hub</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Monitor student performance and engagement</p>
        </div>

        {/* Course Selector */}
        <div className="w-full xl:w-72">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Studio Path</label>
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const course = courses.find(c => c.id === e.target.value);
              setSelectedCourse(course || null);
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-sm"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Analytics Overview */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-1 sm:mb-2">{analytics.total_enrollments}</div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Total Users</div>
              </div>
              <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-green-600 mb-1 sm:mb-2">{analytics.active_students}</div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">In Sync</div>
              </div>
              <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-600 mb-1 sm:mb-2">{Math.round(analytics.completion_rate)}%</div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Flow Rate</div>
              </div>
              <div className="glass-card p-4 sm:p-6 rounded-2xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-orange-600 mb-1 sm:mb-2">{Math.round(analytics.average_quiz_score)}%</div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">Cognitive Avg</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status Filter</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Search Students</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Students ({enrollments.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {enrollments.length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <h4 className="font-bold text-slate-900 mb-2">No students found</h4>
                    <p className="text-sm text-slate-600">No students match your current filters.</p>
                  </div>
                ) : (
                  enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className={`glass-card p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md ${selectedStudent?.id === enrollment.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      onClick={() => {
                        setSelectedStudent(enrollment);
                        loadStudentProgress(selectedCourse.id, enrollment.user.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900">{enrollment.user.full_name}</h4>
                          <p className="text-sm text-slate-600">{enrollment.user.email}</p>
                        </div>
                        {getStatusBadge(enrollment.status)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-bold">{Math.round(enrollment.progress_percentage)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(enrollment.progress_percentage)}`}
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Student Detail */}
            <div>
              {selectedStudent && studentProgress ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {selectedStudent.user.full_name} - Detailed Progress
                  </h3>

                  <div className="space-y-4">
                    {/* Enrollment Info */}
                    <div className="glass-card p-6 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-3">Enrollment Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Enrolled On</span>
                          <div className="font-bold text-slate-900">{new Date(studentProgress.enrollment.enrolled_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Progress</span>
                          <div className="font-bold text-slate-900">{Math.round(studentProgress.enrollment.progress_percentage)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Topic Progress */}
                    <div className="glass-card p-6 rounded-2xl">
                      <h4 className="font-bold text-slate-900 mb-3">Topic Progress</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {studentProgress.topic_progress.map((topic) => (
                          <div key={topic.topic_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{topic.topic_title}</div>
                              <div className="text-xs text-slate-600">
                                Time spent: {formatDuration(topic.time_spent)}
                                {topic.completed_at && (
                                  <span className="ml-2">• Completed: {new Date(topic.completed_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {topic.status === 'completed' && <span className="text-green-600">✓</span>}
                              {topic.status === 'in_progress' && <span className="text-yellow-600">⏳</span>}
                              {topic.status === 'not_started' && <span className="text-slate-400">○</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quiz Attempts */}
                    {studentProgress.quiz_attempts.length > 0 && (
                      <div className="glass-card p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-900 mb-3">Quiz Performance</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {studentProgress.quiz_attempts.map((attempt, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{attempt.topic_title}</div>
                                <div className="text-xs text-slate-600">
                                  Attempted: {new Date(attempt.attempted_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className={`font-bold text-lg ${attempt.score >= 80 ? 'text-green-600' :
                                  attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {attempt.score}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 rounded-2xl text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Student</h3>
                  <p className="text-slate-600">Click on a student to view their detailed progress.</p>
                </div>
              )}
            </div>
          </div>

          {/* Struggling Students Alert */}
          {analytics && analytics.struggling_students.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-red-900 mb-4">⚠️ Students Needing Attention</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.struggling_students.map((student) => (
                  <div key={student.user_id} className="bg-red-50 p-4 rounded-lg">
                    <div className="font-semibold text-red-900">{student.full_name}</div>
                    <div className="text-sm text-red-700">
                      Progress: {Math.round(student.progress)}% • Avg Score: {Math.round(student.average_score)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
