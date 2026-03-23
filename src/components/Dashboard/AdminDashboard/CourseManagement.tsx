'use client';

import React, { useState, useEffect } from 'react';
import { adminService, AdminCourse } from '@/services/api/adminService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';
import { FileViewer } from '@/components/Shared/FileViewer';

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    search: ''
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingCourseFiles, setViewingCourseFiles] = useState<string | null>(null);
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 50 };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.department !== 'all') params.department = filters.department;
      
      const data = await adminService.getAllCourses(params);
      setCourses(data.courses);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId: string) => {
    try {
      await adminService.approveCourse(courseId);
      showNotification('Course approved successfully', 'success');
      loadCourses();
    } catch (err) {
      showNotification('Failed to approve course', 'error');
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await adminService.rejectCourse(courseId, reason);
      showNotification('Course rejected', 'success');
      loadCourses();
    } catch (err) {
      showNotification('Failed to reject course', 'error');
    }
  };

  const handleFeatureCourse = async (courseId: string, featured: boolean) => {
    try {
      await adminService.featureCourse(courseId, featured);
      showNotification(`Course ${featured ? 'featured' : 'unfeatured'} successfully`, 'success');
      loadCourses();
    } catch (err) {
      showNotification('Failed to update course feature status', 'error');
    }
  };

  const handleStatusChange = async (courseId: string, status: 'published' | 'draft') => {
    try {
      await adminService.changeCourseStatus(courseId, status);
      showNotification(`Course status changed to ${status}`, 'success');
      loadCourses();
    } catch (err) {
      showNotification('Failed to change course status', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const displayStatus = status === 'published' ? 'active' : status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {displayStatus.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Course Management</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Course Management</h2>
          <p className="text-slate-600 text-sm">Manage and approve courses across all departments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          + Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-600">No courses match your current filters.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className="text-slate-600 text-sm mb-2">
                    <span className="font-semibold">{course.code}</span> • {course.department} • {course.instructor}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>👥 {course.enrollments} students</span>
                    <span>📅 {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveCourse(course.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleRejectCourse(course.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  
                  {/* Status Change Buttons */}
                  {course.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(course.id, 'published')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      📢 Publish
                    </button>
                  )}
                  {(course.status === 'active' || course.status === 'published') && (
                    <button
                      onClick={() => handleStatusChange(course.id, 'draft')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      📝 Draft
                    </button>
                  )}
                  
                  {course.status === 'active' && (
                    <button
                      onClick={() => handleFeatureCourse(course.id, true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      ⭐ Feature
                    </button>
                  )}
                  <button 
                    onClick={() => setViewingCourseFiles(course.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    📁 Files
                  </button>
                  <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                    📊 Analytics
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-blue-600 mb-2">
            {courses.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Active Courses</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-yellow-600 mb-2">
            {courses.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Pending Approval</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-green-600 mb-2">
            {courses.reduce((sum, c) => sum + c.enrollments, 0)}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Enrollments</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-purple-600 mb-2">
            {new Set(courses.map(c => c.department)).size}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Departments</div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingCourseFiles && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900">Course Files</h3>
              <button
                onClick={() => setViewingCourseFiles(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <FileViewer
                context={{
                  type: 'course',
                  courseId: viewingCourseFiles
                }}
                showReadAloud={false}
                showDownload={true}
                showDelete={true}
                onFileDelete={() => {
                  // Refresh or handle file deletion
                  console.log('File deleted by admin');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};