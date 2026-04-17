'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CreateCourseData } from '@/services/api/lecturerService';
import { Course } from '@/services/api/courseService';

interface CourseManagementProps {
  onEditCourse: (courseId: string) => void;
}

export const CourseManagement: React.FC<CourseManagementProps> = ({ onEditCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCourseData>({
    code: '',
    title: '',
    description: '',
    department: '',
    level: 'beginner',
    duration: '',
    tags: []
  });
  const [editFormData, setEditFormData] = useState<CreateCourseData>({
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

  const handleUnpublishCourse = async (courseId: string) => {
    try {
      await lecturerService.unpublishCourse(courseId);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_active: false } : c));
    } catch (err) {
      setError('Failed to move course to draft');
      console.error('Error unpublishing course:', err);
    }
  };

  const openEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setEditFormData({
      code: course.code,
      title: course.title,
      description: course.description,
      department: course.department,
      level: course.level,
      duration: course.duration,
      tags: course.tags || []
    });
    setThumbnailPreview(course.thumbnail || null);
    setThumbnailFile(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCourseId(null);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId) return;

    try {
      setIsUpdatingCourse(true);

      // 1. Update course basic info
      const updatedCourse = await lecturerService.updateCourse(editingCourseId, editFormData);

      // 2. If a new thumbnail is selected, upload it
      if (thumbnailFile) {
        setIsUploadingThumbnail(true);
        try {
          const uploadRes = await lecturerService.uploadCoursePicture(editingCourseId, thumbnailFile);
          updatedCourse.thumbnail = uploadRes.data.thumbnail_url;
        } catch (uploadErr) {
          console.error('Error uploading thumbnail:', uploadErr);
          setError('Course info updated, but thumbnail upload failed');
        } finally {
          setIsUploadingThumbnail(false);
        }
      }

      setCourses((prevCourses) => prevCourses.map((course) => (course.id === editingCourseId ? updatedCourse : course)));
      closeEditModal();
    } catch (err) {
      setError('Failed to update course');
      console.error('Error updating course:', err);
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-6 sm:p-8 rounded-4xl border border-slate-200 shadow-inner">
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
        <div className="glass-card rounded-4xl p-8 sm:p-12 border-blue-100 shadow-2xl animate-fade-in">
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

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeEditModal}
            aria-label="Close edit course modal overlay"
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-white/70 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Edit Course</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Update course details</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                aria-label="Close edit course modal"
              >
                ✕
              </button>
            </div>

            <div className="mb-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 group hover:border-blue-400 transition-all">
              <div className="relative w-40 h-40 mb-4 rounded-2xl overflow-hidden shadow-lg bg-white">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Course Thumbnail Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
                {isUploadingThumbnail && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                  {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </label>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">PNG, JPG or WebP (Max 2MB)</p>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Code</label>
                  <input
                    type="text"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold h-28"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</label>
                  <select
                    value={editFormData.level}
                    onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                  <input
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editFormData.tags.join(', ')}
                  onChange={(e) => setEditFormData({
                    ...editFormData,
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-4 sm:px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  placeholder="AI, Education, Accessibility"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingCourse || isUploadingThumbnail}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUpdatingCourse ? 'Saving...' : isUploadingThumbnail ? 'Uploading image...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-card rounded-3xl sm:rounded-4xl p-5 sm:p-8 lg:p-10 border-white/60 hover-lift shadow-2xl shadow-slate-900/5 group overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                {course.code}
              </p>
              <div className="flex gap-3">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${course.is_active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${course.is_active ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'}`} />
                  {course.is_active ? 'Published' : 'Draft'}
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6 sm:mb-8">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors wrap-break-word">
                {course.title}
              </h3>
              <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-5xl">📚</span>
                  </div>
                )}
              </div>
              <p className="text-base text-slate-600 wrap-break-word leading-relaxed">{course.description}</p>
            </div>

            <div className="flex flex-col gap-5 sm:gap-6 border-t border-slate-100 pt-5 sm:pt-8">
              <div className="grid grid-cols-2 gap-6 sm:gap-10 w-full">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollments</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{course.enrollment_count || 0} <span className="text-sm">Students</span></p>
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 capitalize leading-tight break-words">{course.level}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full overflow-x-auto pb-2 scrollbar-hide">
                {course.is_active && (
                  <a
                    href={`/courses/${course.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-3 sm:px-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-600 hover:text-white transition-all gap-2 whitespace-nowrap min-w-fit flex-1 sm:flex-none"
                    title="View Course Studio"
                  >
                    <span>👁️</span>
                    <span className="text-[10px] uppercase font-black">View</span>
                  </a>
                )}
                {!course.is_active && (
                  <button
                    onClick={() => handlePublishCourse(course.id)}
                    className="h-10 px-3 sm:px-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-600 hover:text-white transition-all gap-2 whitespace-nowrap min-w-fit flex-1 sm:flex-none"
                    title="Publish Course"
                  >
                    <span>⬆️</span>
                    <span className="text-[10px] uppercase font-black">Publish</span>
                  </button>
                )}
                {course.is_active && (
                  <button
                    onClick={() => handleUnpublishCourse(course.id)}
                    className="h-10 px-3 sm:px-4 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white transition-all gap-2 whitespace-nowrap min-w-fit flex-1 sm:flex-none"
                    title="Move Course to Draft"
                  >
                    <span>📝</span>
                    <span className="text-[10px] uppercase font-black">Draft</span>
                  </button>
                )}
                <button
                  onClick={() => openEditModal(course)}
                  className="h-10 px-3 sm:px-4 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold hover:bg-blue-600 hover:text-white transition-all gap-2 whitespace-nowrap min-w-fit flex-1 sm:flex-none"
                  title="Edit Course"
                >
                  <span>✏️</span>
                  <span className="text-[10px] uppercase font-black">Edit</span>
                </button>
                <button
                  onClick={() => onEditCourse(course.id)}
                  className="h-10 px-3 sm:px-4 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold hover:bg-slate-900 hover:text-white transition-all gap-2 whitespace-nowrap min-w-fit flex-1 sm:flex-none"
                  title="Edit Modules & Topics"
                >
                  <span>⚙️</span>
                  <span className="text-[10px] uppercase font-black">Modules</span>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="h-10 w-10 sm:w-12 rounded-xl bg-slate-100 text-red-600 flex items-center justify-center font-black hover:bg-red-600 hover:text-white transition-all flex-shrink-0"
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
