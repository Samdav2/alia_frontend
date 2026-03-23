'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CourseEnrollment } from '@/services/api/lecturerService';
import { Course } from '@/services/api/courseService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

export const NotificationCenter: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { showNotification } = useVisualNotification();

  const [notificationForm, setNotificationForm] = useState({
    course_id: '',
    recipient_type: 'all' as 'all' | 'struggling' | 'specific',
    student_ids: [] as string[],
    title: '',
    message: '',
    type: 'announcement' as 'announcement' | 'reminder' | 'alert'
  });

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseEnrollments(selectedCourse.id);
      setNotificationForm(prev => ({ ...prev, course_id: selectedCourse.id }));
    }
  }, [selectedCourse]);

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

  const loadCourseEnrollments = async (courseId: string) => {
    try {
      const data = await lecturerService.getCourseEnrollments(courseId, { page: 1, limit: 100 });
      setEnrollments(data.enrollments);
    } catch (err) {
      console.error('Error loading enrollments:', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (notificationForm.recipient_type === 'specific' && notificationForm.student_ids.length === 0) {
      showNotification('Please select at least one student', 'error');
      return;
    }

    try {
      setSending(true);
      await lecturerService.sendNotification(notificationForm);
      showNotification('Notification sent successfully', 'success');

      // Reset form
      setNotificationForm({
        ...notificationForm,
        title: '',
        message: '',
        student_ids: []
      });
    } catch (err) {
      showNotification('Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setNotificationForm(prev => ({
      ...prev,
      student_ids: prev.student_ids.includes(studentId)
        ? prev.student_ids.filter(id => id !== studentId)
        : [...prev.student_ids, studentId]
    }));
  };

  const selectAllStudents = () => {
    setNotificationForm(prev => ({
      ...prev,
      student_ids: enrollments.map(e => e.user.id)
    }));
  };

  const clearStudentSelection = () => {
    setNotificationForm(prev => ({
      ...prev,
      student_ids: []
    }));
  };

  const getRecipientCount = () => {
    switch (notificationForm.recipient_type) {
      case 'all':
        return enrollments.length;
      case 'struggling':
        return enrollments.filter(e => e.progress_percentage < 50).length;
      case 'specific':
        return notificationForm.student_ids.length;
      default:
        return 0;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'reminder': return '⏰';
      case 'alert': return '⚠️';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Notification Center</h2>
        </div>
        <div className="glass-card p-8 rounded-2xl animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notification Center</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Send announcements and messages to your students</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notification Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Send Notification</h3>

              <form onSubmit={handleSendNotification} className="space-y-6">
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Notification Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['announcement', 'reminder', 'alert'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNotificationForm({ ...notificationForm, type })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex sm:flex-col items-center gap-3 sm:gap-2 ${notificationForm.type === type
                            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                          }`}
                      >
                        <div className="text-xl sm:text-2xl">{getTypeIcon(type)}</div>
                        <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Recipients</label>
                  <div className="space-y-3">
                    {(['all', 'struggling', 'specific'] as const).map((recipientType) => (
                      <label key={recipientType} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="recipient_type"
                          value={recipientType}
                          checked={notificationForm.recipient_type === recipientType}
                          onChange={(e) => setNotificationForm({
                            ...notificationForm,
                            recipient_type: e.target.value as any,
                            student_ids: [] // Reset selection when changing type
                          })}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {recipientType === 'all' && `All Students (${enrollments.length})`}
                          {recipientType === 'struggling' && `Struggling Students (${enrollments.filter(e => e.progress_percentage < 50).length})`}
                          {recipientType === 'specific' && 'Specific Students'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Specific Student Selection */}
                {notificationForm.recipient_type === 'specific' && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-bold text-slate-700">Select Students</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={selectAllStudents}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={clearStudentSelection}
                          className="text-xs text-slate-600 hover:text-slate-700 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-4 space-y-2">
                      {enrollments.map((enrollment) => (
                        <label key={enrollment.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                          <input
                            type="checkbox"
                            checked={notificationForm.student_ids.includes(enrollment.user.id)}
                            onChange={() => toggleStudentSelection(enrollment.user.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{enrollment.user.full_name}</div>
                            <div className="text-xs text-slate-600">{enrollment.user.email}</div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {Math.round(enrollment.progress_percentage)}% progress
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter notification title..."
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your message..."
                    required
                  />
                </div>

                {/* Send Button */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    Will be sent to {getRecipientCount()} student{getRecipientCount() !== 1 ? 's' : ''}
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                  >
                    {sending ? 'Sending...' : 'Send Notification'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Templates & Stats */}
          <div className="space-y-6">
            {/* Quick Templates */}
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-4">Quick Templates</h4>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setNotificationForm({
                    ...notificationForm,
                    type: 'reminder',
                    title: 'Assignment Reminder',
                    message: 'This is a friendly reminder that your assignment is due soon. Please make sure to submit it on time.'
                  })}
                  className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <div className="font-semibold text-yellow-800">Assignment Reminder</div>
                  <div className="text-xs text-yellow-600">Remind students about upcoming deadlines</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationForm({
                    ...notificationForm,
                    type: 'announcement',
                    title: 'Class Update',
                    message: 'I wanted to share an important update about our class. Please read this message carefully.'
                  })}
                  className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-semibold text-blue-800">Class Update</div>
                  <div className="text-xs text-blue-600">General class announcements</div>
                </button>

                <button
                  type="button"
                  onClick={() => setNotificationForm({
                    ...notificationForm,
                    type: 'alert',
                    recipient_type: 'struggling',
                    title: 'Academic Support Available',
                    message: 'I noticed you might need some additional support. Please reach out to me during office hours or schedule a meeting.'
                  })}
                  className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="font-semibold text-red-800">Support Offer</div>
                  <div className="text-xs text-red-600">Reach out to struggling students</div>
                </button>
              </div>
            </div>

            {/* Course Stats */}
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-4">Course Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Students</span>
                  <span className="font-bold text-slate-900">{enrollments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Students</span>
                  <span className="font-bold text-green-600">
                    {enrollments.filter(e => e.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Struggling Students</span>
                  <span className="font-bold text-red-600">
                    {enrollments.filter(e => e.progress_percentage < 50).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Completed</span>
                  <span className="font-bold text-blue-600">
                    {enrollments.filter(e => e.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
