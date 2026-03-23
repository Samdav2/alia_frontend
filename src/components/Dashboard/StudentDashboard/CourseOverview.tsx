'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService, CourseDetails } from '@/services/api/courseService';
import { enrollmentAPIService } from '@/services/api/enrollmentService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

interface CourseOverviewProps {
  courseId: string;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({ courseId }) => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId || courseId === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const courseData = await courseService.getCourseDetails(courseId);
      setCourse(courseData);
      // Use backend enrollment status instead of local service
      setIsEnrolled(courseData.is_enrolled || false);
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!course) return;

    setIsEnrolling(true);

    try {
      await enrollmentAPIService.enrollInCourse(courseId);
      setIsEnrolled(true);
      showNotification(`Successfully enrolled in ${course.title}! 🎉`, 'success');
      textToSpeechService.announce(`You have successfully enrolled in ${course.title}. You can now start your first lesson!`);
      
      // Reload course data to get updated enrollment status
      loadCourseData();
    } catch (err) {
      console.error('Enrollment failed:', err);
      showNotification('Enrollment failed. Please try again.', 'error');
      textToSpeechService.announce('Enrollment failed. Please try again.');
    }

    setIsEnrolling(false);
  };

  const getFirstTopicId = () => {
    if (course?.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule.topics && firstModule.topics.length > 0) {
        return firstModule.topics[0].id;
      }
    }
    return null;
  };

  const firstTopicId = getFirstTopicId();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 mb-4">
            {error || 'Course Not Found'}
          </h1>
          <p className="text-slate-600 mb-6">
            {error ? 'There was an error loading the course data.' : 'The requested course could not be found.'}
          </p>
          <Link href="/dashboard/student/courses" className="text-blue-600 font-bold hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/dashboard/student/courses" className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
            <span>←</span> Back to Courses
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Course Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {course.code}
                </span>
                {isEnrolled && (
                  <span className="text-xs font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
                    ✓ Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-slate-600 font-bold text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{course.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>{course.enrollment_count} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span>{course.rating}/5</span>
                </div>
              </div>
            </div>

            {/* Enrollment Action */}
            <div className="lg:w-80">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">
                        ✓
                      </div>
                      <h3 className="font-black text-green-700 text-lg">Enrolled!</h3>
                      <p className="text-sm text-slate-600 font-medium">You can now start learning</p>
                    </div>

                    {firstTopicId ? (
                      <Link
                        href={`/courses/${courseId}/topics/${firstTopicId}`}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-center hover:shadow-xl transition-all hover-lift block"
                      >
                        Start Learning →
                      </Link>
                    ) : (
                      <div className="w-full px-6 py-4 bg-gray-400 text-white rounded-xl font-black text-center cursor-not-allowed">
                        No Content Available
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">
                        📚
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">Ready to Learn?</h3>
                      <p className="text-sm text-slate-600 font-medium">Enroll now to start your journey</p>
                    </div>

                    <button
                      onClick={handleEnrollment}
                      disabled={isEnrolling}
                      className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-black hover:bg-green-600 transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>

                    <p className="text-xs text-slate-500 text-center font-medium">
                      Free enrollment • Start immediately
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Description */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4">About This Course</h2>
          <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">
            {course.description}
          </p>

          {course.tags && course.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Course Curriculum */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">Course Curriculum</h2>

          <div className="space-y-6">
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module, moduleIdx) => (
                <div key={module.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-700 text-base sm:text-lg">
                      Module {module.order}: {module.title}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">{module.duration}</span>
                  </div>

                  {module.description && (
                    <p className="text-sm text-slate-600 font-medium mb-3">{module.description}</p>
                  )}

                  <div className="space-y-2">
                    {module.topics && module.topics.length > 0 ? (
                      module.topics.map((topic, topicIdx) => (
                        <div
                          key={topic.id}
                          className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${isEnrolled
                            ? 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md cursor-pointer'
                            : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                            }`}
                          onClick={() => {
                            if (isEnrolled) {
                              window.location.href = `/courses/${courseId}/topics/${topic.id}`;
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isEnrolled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'
                              }`}>
                              {topic.order}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{topic.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span>{Math.floor(topic.duration / 60)}m</span>
                                <span>•</span>
                                <span className="capitalize">{topic.content_type}</span>
                              </div>
                            </div>
                          </div>

                          {!isEnrolled && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-xs font-bold">🔒</span>
                              <span className="text-xs font-bold hidden sm:inline">Locked</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500">
                        <p className="text-sm">No topics available for this module</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-slate-700 mb-2">Course Content Coming Soon</h3>
                <p className="text-sm">The course curriculum is being prepared and will be available soon.</p>
              </div>
            )}
          </div>

          {!isEnrolled && course.modules && course.modules.length > 0 && (
            <div className="mt-8 text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-700 font-bold text-sm sm:text-base">
                🔒 Enroll in this course to unlock all lessons and start learning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
