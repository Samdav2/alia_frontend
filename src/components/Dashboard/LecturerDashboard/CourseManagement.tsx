'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CreateCourseData } from '@/services/api/lecturerService';
import { Course } from '@/services/api/courseService';
import { FileViewer } from '@/components/Shared/FileViewer';

interface CourseManagementProps {
  onEditCourse: (courseId: string) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ onEditCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingCourseFiles, setViewingCourseFiles] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCourseData>({
    code: '',
    title: '',
    description: '',
    department: '',
    level: 'beginner',
    duration: '',
    tags: []
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getMyCourses();
      setCourses(data.courses);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCourse = await lecturerService.createCourse(formData);
      setCourses([...courses, newCourse]);
      setShowForm(false);
      setFormData({
        code: '',
        title: '',
        description: '',
        department: '',
        level: 'beginner',
        duration: '',
        tags: []
      });
    } catch (err) {
      setError('Failed to create course');
      console.error('Error creating course:', err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await lecturerService.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      setError('Failed to delete course');
      console.error('Error deleting course:', err);
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      await lecturerService.publishCourse(courseId);
      // Optimistic update
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_active: true } : c));
      // showNotification('Course published!', 'success'); // If available
    } catch (err) {
      setError('Failed to publish course');
      console.error('Error publishing course:', err);
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
    <div className="space-y-12">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-inner">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI Content Studio</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Deploy intelligent learning paths</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all hover-lift active:scale-95"
        >
          + New Studio Path
        </button>
      </div>

      {/* AI Studio Creator Zone */}
      <div className="border-4 border-dashed border-slate-200 rounded-[40px] p-8 sm:p-20 flex flex-col items-center justify-center text-center group hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
        <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-125 transition-transform group-hover:rotate-12">📁</div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Drop PDFs to AI-Synthesize</h3>
        <p className="text-slate-500 font-bold tracking-wide max-w-sm mx-auto text-xs sm:text-sm">
          Drag and drop your course materials. ALIA will automatically generate adaptive quizzes, summaries, and GAZE-optimized layouts.
        </p>
      </div>

      {showForm && (
        <div className="glass-card rounded-[32px] p-8 sm:p-12 border-blue-100 shadow-2xl animate-fade-in">
          <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
            Configure Path
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Studio Reference (e.g., EDU 501)
                </label>
                <input
                  type="text"
                  placeholder="Course Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Human-Readable Title
                </label>
                <input
                  type="text"
                  placeholder="Course Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold h-32"
                required
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g., 12 weeks"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover-lift active:scale-95"
              >
                Initialize AI Engine
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto text-slate-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-card rounded-[32px] p-10 border-white/60 hover-lift shadow-2xl shadow-slate-900/5 group"
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                  {course.code}
                </p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2">{course.description}</p>
              </div>
              <div className="flex gap-3">
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${course.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${course.is_active ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                  {course.is_active ? 'Published' : 'Draft'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-slate-100 pt-8">
              <div className="flex gap-6 sm:gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollments</p>
                  <p className="text-2xl font-black text-slate-900">{course.enrollment_count || 0} <span className="text-sm">Students</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p>
                  <p className="text-2xl font-black text-slate-900 capitalize">{course.level}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {course.is_active && (
                  <a
                    href={`/courses/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-600 hover:text-white transition-all gap-2"
                    title="View Course Studio"
                  >
                    <span>👁️</span>
                    <span className="text-[10px] uppercase font-black">View</span>
                  </a>
                )}
                {!course.is_active && (
                  <button
                    onClick={() => handlePublishCourse(course.id)}
                    className="h-12 px-4 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold hover:bg-green-600 hover:text-white transition-all gap-2"
                    title="Publish Course"
                  >
                    <span>📤</span>
                    <span className="text-[10px] uppercase font-black">Publish</span>
                  </button>
                )}
                <button
                  onClick={() => onEditCourse(course.id)}
                  className="h-12 px-4 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold hover:bg-blue-600 hover:text-white transition-all gap-2"
                  title="Edit Modules & Topics"
                >
                  <span>⚙️</span>
                  <span className="text-[10px] uppercase font-black">Modules</span>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="w-12 h-12 rounded-xl bg-slate-100 text-red-600 flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all"
                  title="Delete Course"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
