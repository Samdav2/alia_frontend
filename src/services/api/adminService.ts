// Admin Service - Backend API Integration
import apiClient from '@/lib/apiClient';
import { UserProfile } from './userService';
import { Course } from './courseService';

export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  student_id?: string;
}

export interface UpdateUserData {
  full_name?: string;
  role?: 'student' | 'lecturer' | 'admin';
  is_active?: boolean;
  department?: string;
}

export interface UsersListResponse {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  statistics: {
    total_users: number;
    active_users: number;
    by_role: {
      student: number;
      lecturer: number;
      admin: number;
    };
  };
}

export interface SystemStatistics {
  users: {
    total: number;
    active: number;
    new_this_month: number;
  };
  courses: {
    total: number;
    active: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  engagement: {
    daily_active_users: number;
    average_session_time: number;
    total_learning_hours: number;
  };
}

export interface AccessibilityReport {
  total_users_with_disabilities: number;
  by_disability_type: Array<{ type: string; count: number }>;
  feature_usage: {
    bionic_reading: number;
    voice_navigation: number;
    high_contrast: number;
    screen_reader: number;
  };
  accommodation_requests: Array<{
    user_id: string;
    full_name: string;
    disability_type: string;
    accommodations_needed: string[];
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

export interface PerformanceMetrics {
  time_series: Array<{
    date: string;
    active_users: number;
    enrollments: number;
    completions: number;
  }>;
  top_courses: Array<{
    course_id: string;
    title: string;
    enrollments: number;
    completion_rate: number;
  }>;
  top_instructors: Array<{
    instructor_id: string;
    full_name: string;
    courses: number;
    total_students: number;
    average_rating: number;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    response_time: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  api: {
    requests_per_minute: number;
    average_response_time: number;
    error_rate: number;
  };
  recent_errors: Array<{
    timestamp: string;
    error: string;
    count: number;
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'maintenance' | 'update' | 'announcement';
  priority: 'high' | 'medium' | 'low';
  target_roles: string[];
  start_date: string;
  end_date: string;
  created_at: string;
  status: 'active' | 'scheduled' | 'expired';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  student_count: number;
  course_count: number;
  description?: string;
}

export interface AdminCourse extends Course {
  status: 'active' | 'draft' | 'pending' | 'rejected' | 'archived' | 'published';
  enrollments: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user: {
    id: string;
    full_name: string;
  };
  action: 'create' | 'update' | 'delete' | 'login';
  resource_type: 'user' | 'course' | 'enrollment' | 'system';
  resource_id: string;
  changes?: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

class AdminService {
  // ========== USER MANAGEMENT ==========

  // Get all users (enhanced)
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: 'student' | 'lecturer' | 'admin';
    department?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<UsersListResponse> {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data.data;
  }

  // Create user
  async createUser(data: CreateUserData): Promise<UserProfile> {
    const response = await apiClient.post('/api/admin/users', data);
    return response.data.data;
  }

  // Update user
  async updateUser(userId: string, data: UpdateUserData): Promise<UserProfile> {
    const response = await apiClient.put(`/api/admin/users/${userId}`, data);
    return response.data.data;
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${userId}`);
  }

  // Bulk user actions
  async bulkUserAction(action: 'activate' | 'deactivate' | 'delete', userIds: string[]): Promise<void> {
    await apiClient.post('/api/admin/users/bulk-action', {
      action,
      user_ids: userIds
    });
  }

  // ========== COURSE MANAGEMENT ==========

  // Get all courses (admin view)
  async getAllCourses(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'draft' | 'archived';
    instructor_id?: string;
    department?: string;
  }): Promise<{ courses: AdminCourse[]; pagination: any }> {
    const response = await apiClient.get('/api/admin/courses', { params });
    return response.data.data;
  }

  // Approve course
  async approveCourse(courseId: string): Promise<void> {
    await apiClient.put(`/api/admin/courses/${courseId}/approve`);
  }

  // Reject course
  async rejectCourse(courseId: string, reason: string): Promise<void> {
    await apiClient.put(`/api/admin/courses/${courseId}/reject`, { reason });
  }

  // Feature course
  async featureCourse(courseId: string, featured: boolean, featuredOrder?: number): Promise<void> {
    await apiClient.put(`/api/admin/courses/${courseId}/feature`, {
      featured,
      featured_order: featuredOrder
    });
  }

  // Change course status
  async changeCourseStatus(courseId: string, status: 'published' | 'draft'): Promise<void> {
    await apiClient.put(`/api/admin/courses/${courseId}/status`, {
      status
    });
  }

  // ========== SYSTEM ANALYTICS ==========

  // Get system statistics
  async getSystemStatistics(): Promise<SystemStatistics> {
    const response = await apiClient.get('/api/admin/statistics');
    return response.data.data;
  }

  // Get accessibility report
  async getAccessibilityReport(): Promise<AccessibilityReport> {
    const response = await apiClient.get('/api/admin/accessibility-report');
    return response.data.data;
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: {
    start_date?: string;
    end_date?: string;
    metric_type?: 'engagement' | 'completion' | 'satisfaction';
  }): Promise<PerformanceMetrics> {
    const response = await apiClient.get('/api/admin/performance-metrics', { params });
    return response.data.data;
  }

  // ========== SYSTEM HEALTH ==========

  // Get system health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get('/api/admin/system-health');
    return response.data.data;
  }

  // ========== ANNOUNCEMENTS ==========

  // Create announcement
  async createAnnouncement(data: {
    title: string;
    message: string;
    type: 'maintenance' | 'update' | 'announcement';
    priority: 'high' | 'medium' | 'low';
    target_roles: string[];
    start_date: string;
    end_date: string;
  }): Promise<Announcement> {
    const response = await apiClient.post('/api/admin/announcements', data);
    return response.data.data;
  }

  // Get all announcements
  async getAllAnnouncements(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'scheduled' | 'expired';
  }): Promise<{ announcements: Announcement[]; pagination: any }> {
    const response = await apiClient.get('/api/admin/announcements', { params });
    return response.data.data;
  }

  // Update announcement
  async updateAnnouncement(announcementId: string, data: Partial<Announcement>): Promise<Announcement> {
    const response = await apiClient.put(`/api/admin/announcements/${announcementId}`, data);
    return response.data.data;
  }

  // Delete announcement
  async deleteAnnouncement(announcementId: string): Promise<void> {
    await apiClient.delete(`/api/admin/announcements/${announcementId}`);
  }

  // ========== DEPARTMENT MANAGEMENT ==========

  // Get all departments
  async getAllDepartments(): Promise<Department[]> {
    const response = await apiClient.get('/api/admin/departments');
    return response.data.data.departments;
  }

  // Create department
  async createDepartment(data: {
    name: string;
    code: string;
    head: string;
    description?: string;
  }): Promise<Department> {
    const response = await apiClient.post('/api/admin/departments', data);
    return response.data.data;
  }

  // Update department
  async updateDepartment(departmentId: string, data: Partial<Department>): Promise<Department> {
    const response = await apiClient.put(`/api/admin/departments/${departmentId}`, data);
    return response.data.data;
  }

  // Delete department
  async deleteDepartment(departmentId: string): Promise<void> {
    await apiClient.delete(`/api/admin/departments/${departmentId}`);
  }

  // ========== AUDIT LOGS ==========

  // Get audit logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    action_type?: 'create' | 'update' | 'delete' | 'login';
    resource_type?: 'user' | 'course' | 'enrollment';
    start_date?: string;
    end_date?: string;
  }): Promise<{ logs: AuditLog[]; pagination: any }> {
    const response = await apiClient.get('/api/admin/audit-logs', { params });
    return response.data.data;
  }
}

export const adminService = new AdminService();
