'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { courseService, CourseDetails } from '@/services/api/courseService';
import { progressService as apiProgressService } from '@/services/api/progressService';
import { autonomousAgentService } from '@/services/autonomousAgentService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

interface CurriculumProps {
  courseId: string;
  currentTopicId: string;
}

export const Curriculum: React.FC<CurriculumProps> = ({
  courseId,
  currentTopicId,
}) => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadCurriculumData();
  }, [courseId]);

  const loadCurriculumData = async () => {
    try {
      setLoading(true);
      
      // Load course details from API
      const courseData = await courseService.getCourseDetails(courseId);
      setCourse(courseData);

      // Load progress from API or localStorage fallback
      let completedTopicIds: string[] = [];
      let courseCompleted = false;

      try {
        const progressData = await apiProgressService.getCourseProgress(courseId);
        // Extract completed topic IDs from progress data
        if (progressData.completed_topics) {
          completedTopicIds = progressData.completed_topics;
        }
        courseCompleted = progressData.is_completed || false;
      } catch (apiError) {
        console.error('API progress fetch failed, using localStorage fallback:', apiError);
        
        // Fallback to localStorage
        const savedProgress = localStorage.getItem('course-progress');
        if (savedProgress) {
          try {
            const progressData = JSON.parse(savedProgress);
            const courseProgress = progressData[courseId];
            if (courseProgress) {
              completedTopicIds = courseProgress.topicsCompleted || [];
              courseCompleted = courseProgress.isCompleted || false;
            }
          } catch (e) {
            console.error('Failed to load progress from localStorage', e);
          }
        }
      }

      setCompletedTopics(completedTopicIds);
      setIsCourseCompleted(courseCompleted);
    } catch (error) {
      console.error('Error loading curriculum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeCourse = async () => {
    if (confirm('Are you sure you want to retake this course? All progress will be reset.')) {
      try {
        // Try to reset progress via API
        await apiProgressService.resetCourseProgress(courseId);
      } catch (apiError) {
        console.error('API reset failed, using localStorage fallback:', apiError);
      }

      // Also reset localStorage progress as fallback
      autonomousAgentService.resetCourseProgress(courseId);
      
      showNotification('Course progress reset! You can now retake from the beginning. 🔄', 'success');
      
      if (autonomousAgentService.getVoiceEnabled()) {
        textToSpeechService.announce('Course progress has been reset. You can now retake the course from the beginning.');
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Failed to load curriculum</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight border-b border-slate-200 pb-6">
          Curriculum
        </h2>
      </div>

      {/* Course Completed Banner */}
      {isCourseCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl">
              🎓
            </div>
            <div>
              <h3 className="font-black text-green-800 text-lg">Course Completed!</h3>
              <p className="text-sm text-green-600 font-medium">Congratulations on finishing</p>
            </div>
          </div>
          
          <button
            onClick={handleRetakeCourse}
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all hover-lift flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Retake Course</span>
          </button>
        </div>
      )}

      <div className="space-y-10">
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((module) => (
            <div key={module.id} className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Module {module.order}: {module.title}
              </h3>
              <div className="space-y-3">
                {module.topics && module.topics.length > 0 ? (
                  module.topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/courses/${courseId}/topics/${topic.id}`}
                      className="group"
                    >
                      <div
                        className={`p-5 rounded-2xl cursor-pointer transition-all hover-lift ${currentTopicId === topic.id
                            ? 'bg-slate-900 text-white shadow-2xl scale-105 ring-4 ring-slate-100'
                            : 'bg-white/40 border border-white/60 hover:bg-white hover:shadow-xl'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {completedTopics.includes(topic.id) ? (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentTopicId === topic.id ? 'bg-green-400 text-slate-900' : 'bg-green-500 text-white'
                                } shadow-lg`}>
                                <span className="text-[10px] font-black">✓</span>
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full border-2 ${currentTopicId === topic.id ? 'border-white/40' : 'border-slate-200 group-hover:border-blue-500'
                                } transition-colors`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-black transition-colors ${currentTopicId === topic.id ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'
                              }`}>
                              {topic.title}
                            </p>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${currentTopicId === topic.id ? 'text-slate-400' : 'text-slate-400 group-hover:text-slate-500'
                              }`}>
                              {Math.floor(topic.duration / 60)}min
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
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
    </div>
  );
};
