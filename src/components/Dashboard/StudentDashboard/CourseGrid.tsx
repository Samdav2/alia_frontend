'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { enrollmentAPIService } from '@/services/api/enrollmentService';
import { progressService as apiProgressService } from '@/services/api/progressService';
import { courseService } from '@/services/api/courseService';
import { COURSES, getCourseTopics } from '@/data/courseData';
import { autonomousAgentService } from '@/services/autonomousAgentService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

interface EnrolledCourse {
  id: string;
  code: string;
  title: string;
  progress: number;
  instructor: string;
  isCompleted: boolean;
  enrollment_id?: string;
}

export const CourseGrid: React.FC = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);

      // Try to get enrolled courses from API
      try {
        const enrollments = await enrollmentAPIService.getUserEnrollments();
        const coursesWithProgress: EnrolledCourse[] = [];

        for (const enrollment of enrollments) {
          if (!enrollment.course_id) continue;
          try {
            // Get course details
            const courseDetails = await courseService.getCourseDetails(enrollment.course_id);

            // Get progress
            let progress = 0;
            let isCompleted = false;

            try {
              const progressData = await apiProgressService.getCourseProgress(enrollment.course_id);
              progress = progressData.progress_percentage;
              isCompleted = progressData.is_completed;
            } catch (progressError) {
              // Fallback to localStorage progress
              const savedProgress = localStorage.getItem('course-progress');
              if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                const courseProgress = progressData[enrollment.course_id];
                if (courseProgress) {
                  const totalTopics = getCourseTopics(enrollment.course_id)?.length || 1;
                  const completedTopics = courseProgress.topicsCompleted?.length || 0;
                  progress = Math.round((completedTopics / totalTopics) * 100);
                  isCompleted = courseProgress.isCompleted || false;
                }
              }
            }

            coursesWithProgress.push({
              id: courseDetails.id,
              code: courseDetails.code,
              title: courseDetails.title,
              progress,
              instructor: courseDetails.instructor,
              isCompleted,
              enrollment_id: enrollment.id
            });
          } catch (courseError) {
            console.error(`Error loading course ${enrollment.course_id}:`, courseError);
          }
        }

        setCourses(coursesWithProgress);
      } catch (apiError) {
        console.error('API enrollment fetch failed, using localStorage fallback:', apiError);

        // Fallback to localStorage-based enrollment
        const savedProgress = localStorage.getItem('course-progress');
        let progressData: Record<string, any> = {};

        if (savedProgress) {
          try {
            progressData = JSON.parse(savedProgress);
          } catch (e) {
            console.error('Failed to load progress', e);
          }
        }

        const coursesWithProgress = Object.values(COURSES).map(course => {
          const courseProgress = progressData[course.id];
          const totalTopics = getCourseTopics(course.id).length;
          const completedTopics = courseProgress?.topicsCompleted?.length || 0;
          const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
          const isCompleted = courseProgress?.isCompleted || false;

          return {
            id: course.id,
            code: course.code,
            title: course.title,
            progress,
            instructor: course.instructor,
            isCompleted,
          };
        }).filter(course => {
          // Only show enrolled courses (check localStorage enrollment)
          const enrollments = localStorage.getItem('enrollments');
          if (enrollments) {
            try {
              const enrollmentData = JSON.parse(enrollments);
              return enrollmentData.includes(course.id);
            } catch (e) {
              return false;
            }
          }
          return false;
        });

        setCourses(coursesWithProgress);
      }
    } catch (err) {
      setError('Failed to load enrolled courses');
      console.error('Error loading enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeCourse = (course: EnrolledCourse, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCourse(course);
    setShowRetakeModal(true);
  };

  const confirmRetake = async () => {
    if (!selectedCourse) return;

    try {
      // Try to reset progress via API
      if (selectedCourse.enrollment_id) {
        try {
          await apiProgressService.resetCourseProgress(selectedCourse.id);
        } catch (apiError) {
          console.error('API reset failed, using localStorage fallback:', apiError);
        }
      }

      // Also reset localStorage progress as fallback
      autonomousAgentService.resetCourseProgress(selectedCourse.id);

      // Show notification
      showNotification(`${selectedCourse.code} has been reset. You can now retake the course! 🔄`, 'success');

      // Voice announcement
      if (autonomousAgentService.getVoiceEnabled()) {
        textToSpeechService.announce(`Course ${selectedCourse.code} has been reset. You can now retake the course from the beginning.`);
      }

      setShowRetakeModal(false);
      setSelectedCourse(null);

      // Reload courses
      await loadEnrolledCourses();
    } catch (err) {
      console.error('Error resetting course:', err);
      showNotification('Failed to reset course. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-[20px] sm:rounded-[32px] p-6 sm:p-8 h-64 animate-pulse">
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-6 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-3 bg-slate-200 rounded w-full mt-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <p className="font-medium">{error}</p>
        <button
          onClick={loadEnrolledCourses}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="glass-card rounded-[32px] p-12 text-center border-white/60">
        <div className="text-6xl mb-6">📚</div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">
          No Enrolled Courses
        </h3>
        <p className="text-slate-600 font-medium mb-6">
          Start your learning journey by enrolling in courses from the marketplace.
        </p>
        <Link
          href="/dashboard/student/courses"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all hover-lift"
        >
          Browse Courses →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {courses.map((course) => (
          <div key={course.id} className="relative group">
            <Link href={`/courses/${course.id}`}>
              <div className="glass-card rounded-[20px] sm:rounded-[32px] p-6 sm:p-8 hover-lift border-white/60 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${course.isCompleted ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
                      <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest">{course.code}</span>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${course.isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                      {course.isCompleted ? '✓ Complete' : 'AI Ready'}
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs sm:text-sm">
                    <span>👤</span>
                    {course.instructor}
                  </div>
                </div>

                <div className="mt-6 sm:mt-10 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Progress</p>
                      <p className="text-lg sm:text-xl font-black text-slate-900">{course.progress}%</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {course.isCompleted ? '🎓' : '→'}
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 sm:h-3 overflow-hidden ring-1 ring-slate-900/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${course.isCompleted
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-700" />
              </div>
            </Link>

            {/* Retake Button for Completed Courses */}
            {course.isCompleted && (
              <button
                onClick={(e) => handleRetakeCourse(course, e)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs hover:bg-orange-600 transition-all hover-lift shadow-lg"
                title="Retake this course"
              >
                🔄 Retake
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Retake Confirmation Modal */}
      {showRetakeModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🔄</span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Retake Course?
                </h3>
                <p className="text-slate-600 font-medium">
                  Are you sure you want to retake <span className="font-black text-slate-900">{selectedCourse.code} - {selectedCourse.title}</span>?
                </p>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 text-left">
                <p className="text-sm font-bold text-orange-800 mb-2">⚠️ This will:</p>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Reset all your progress in this course</li>
                  <li>• Clear all completed topics</li>
                  <li>• Allow you to start fresh from the beginning</li>
                  <li>• Keep your other courses unchanged</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRetakeModal(false);
                    setSelectedCourse(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRetake}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all hover-lift"
                >
                  Yes, Retake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
