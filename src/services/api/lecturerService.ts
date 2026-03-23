// Lecturer Service - Backend API Integration
import apiClient from '@/lib/apiClient';
import { Course, Module, Topic } from './courseService';

export interface CreateCourseData {
  code: string;
  title: string;
  description: string;
  department: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  tags: string[];
  thumbnail?: string;
}

export interface CreateModuleData {
  title: string;
  description: string;
  order: number;
  duration: string;
}

export interface CreateTopicData {
  title: string;
  description: string;
  content: string;
  content_type: 'text' | 'video' | 'interactive';
  order: number;
  duration: string; // Changed from number to string to match backend
  resources?: Array<{
    type: string;
    url: string;
    title: string;
  }>;
}

export interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points: number;
}

export interface CreateQuizData {
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface CourseEnrollment {
  id: string;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  enrolled_at: string;
  progress_percentage: number;
  status: 'active' | 'completed' | 'dropped';
}

export interface CourseAnalytics {
  total_enrollments: number;
  active_students: number;
  completion_rate: number;
  average_progress: number;
  average_quiz_score: number;
  topic_completion_rates: Array<{
    topic_id: string;
    title: string;
    completion_rate: number;
  }>;
  struggling_students: Array<{
    user_id: string;
    full_name: string;
    progress: number;
    average_score: number;
  }>;
}

export interface StudentProgress {
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  enrollment: {
    id: string;
    enrolled_at: string;
    progress_percentage: number;
  };
  topic_progress: Array<{
    topic_id: string;
    topic_title: string;
    status: 'not_started' | 'in_progress' | 'completed';
    time_spent: number;
    completed_at?: string;
  }>;
  quiz_attempts: Array<{
    quiz_id: string;
    topic_title: string;
    score: number;
    attempted_at: string;
  }>;
}

export interface ClassDemographics {
  total_students: number;
  by_department: Array<{ department: string; count: number }>;
  by_disability: Array<{ type: string; count: number }>;
  accessibility_usage: {
    bionic_reading: number;
    voice_navigation: number;
    high_contrast: number;
  };
}

export interface Alert {
  id: string;
  type: 'struggling_student' | 'inactive_student' | 'low_score';
  severity: 'high' | 'medium' | 'low';
  student: {
    id: string;
    full_name: string;
  };
  course: {
    id: string;
    title: string;
  };
  message: string;
  created_at: string;
}

export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  original_filename: string;
  size: number;
  type: string;
  mime_type: string;
  course_id?: string;
  module_id?: string;
  topic_id?: string;
  context: 'course' | 'module' | 'topic' | 'general';
  uploaded_at: string;
  uploaded_by: string;
}

export interface FileInfo {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  type: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  context: string;
}

export interface UploadProgress {
  upload_id: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  id?: string;
  error?: string;
}

class LecturerService {
  // ========== COURSE MANAGEMENT ==========

  // Create new course
  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await apiClient.post('/api/courses', data);
    return response.data.data;
  }

  // Update course
  async updateCourse(courseId: string, data: Partial<CreateCourseData>): Promise<Course> {
    const response = await apiClient.put(`/api/courses/${courseId}`, data);
    return response.data.data;
  }

  // Delete course
  async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/api/courses/${courseId}`);
  }

  // Get my courses
  async getMyCourses(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'draft' | 'archived';
  }): Promise<{ courses: Course[]; pagination: any }> {
    const response = await apiClient.get('/api/lecturer/courses/my', { params });
    return response.data.data;
  }

  // Publish course
  async publishCourse(courseId: string): Promise<void> {
    await apiClient.put(`/api/lecturer/courses/${courseId}/publish`);
  }

  // Unpublish course
  async unpublishCourse(courseId: string): Promise<void> {
    await apiClient.put(`/api/lecturer/courses/${courseId}/unpublish`);
  }

  // ========== MODULE MANAGEMENT ==========

  // Create module
  async createModule(courseId: string, data: CreateModuleData): Promise<Module> {
    const response = await apiClient.post(`/api/lecturer/courses/${courseId}/modules`, {
      ...data,
      course_id: courseId
    });
    return response.data.data;
  }

  // Update module
  async updateModule(moduleId: string, data: Partial<CreateModuleData>): Promise<Module> {
    const response = await apiClient.put(`/api/lecturer/courses/modules/${moduleId}`, data);
    return response.data.data;
  }

  // Delete module
  async deleteModule(moduleId: string): Promise<void> {
    await apiClient.delete(`/api/lecturer/courses/modules/${moduleId}`);
  }

  // Reorder modules
  async reorderModules(courseId: string, moduleOrders: Array<{ module_id: string; order: number }>): Promise<void> {
    await apiClient.put(`/api/lecturer/courses/${courseId}/modules/reorder`, { module_orders: moduleOrders });
  }

  // ========== TOPIC MANAGEMENT ==========

  // Create topic
  async createTopic(moduleId: string, data: CreateTopicData): Promise<Topic> {
    const response = await apiClient.post(`/api/lecturer/courses/modules/${moduleId}/topics`, {
      ...data,
      module_id: moduleId
    });
    return response.data.data;
  }

  // Update topic
  async updateTopic(topicId: string, data: Partial<CreateTopicData>): Promise<Topic> {
    const response = await apiClient.put(`/api/lecturer/courses/topics/${topicId}`, data);
    return response.data.data;
  }

  // Delete topic
  async deleteTopic(topicId: string): Promise<void> {
    await apiClient.delete(`/api/lecturer/courses/topics/${topicId}`);
  }

  // Reorder topics
  async reorderTopics(moduleId: string, topicOrders: Array<{ topic_id: string; order: number }>): Promise<void> {
    await apiClient.put(`/api/lecturer/courses/modules/${moduleId}/topics/reorder`, { topic_orders: topicOrders });
  }

  // ========== QUIZ MANAGEMENT ==========

  // Get quizzes for a course or topic
  async getQuizzes(params?: { course_id?: string; topic_id?: string }): Promise<any[]> {
    const response = await apiClient.get('/api/lecturer/quizzes', { params });
    return response.data.data.quizzes;
  }

  // Create quiz
  async createQuiz(data: CreateQuizData & { topic_id: string }): Promise<any> {
    const response = await apiClient.post('/api/lecturer/quizzes', data);
    return response.data.data;
  }

  // Update quiz
  async updateQuiz(quizId: string, data: Partial<CreateQuizData>): Promise<any> {
    const response = await apiClient.put(`/api/lecturer/quizzes/${quizId}`, data);
    return response.data.data;
  }

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<void> {
    await apiClient.delete(`/api/lecturer/quizzes/${quizId}`);
  }

  // ========== ANALYTICS ==========

  // Get course enrollments
  async getCourseEnrollments(courseId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'completed' | 'dropped';
  }): Promise<{ enrollments: CourseEnrollment[]; pagination: any }> {
    const response = await apiClient.get(`/api/lecturer/courses/${courseId}/enrollments`, { params });
    return response.data.data;
  }

  // Get course analytics
  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const response = await apiClient.get(`/api/lecturer/courses/${courseId}/analytics`);
    return response.data.data;
  }

  // Get student progress
  async getStudentProgress(courseId: string, studentId: string): Promise<StudentProgress> {
    const response = await apiClient.get(`/api/lecturer/courses/${courseId}/students/${studentId}/progress`);
    return response.data.data;
  }

  // Get class demographics
  async getClassDemographics(): Promise<ClassDemographics> {
    const response = await apiClient.get('/api/lecturer/class-demographics');
    return response.data.data;
  }

  // ========== ALERTS & NOTIFICATIONS ==========

  // Get alerts
  async getAlerts(): Promise<Alert[]> {
    const response = await apiClient.get('/api/lecturer/alerts');
    return response.data.data.alerts;
  }

  // Send notification to students
  async sendNotification(data: {
    course_id: string;
    recipient_type: 'all' | 'struggling' | 'specific';
    student_ids?: string[];
    title: string;
    message: string;
    type: 'announcement' | 'reminder' | 'alert';
  }): Promise<void> {
    await apiClient.post('/api/lecturer/notifications', data);
  }

  // ========== FILE UPLOAD & MANAGEMENT ==========

  // Enhanced file upload with context
  async uploadFile(
    file: File, 
    type: 'thumbnail' | 'video' | 'document' | 'resource' | 'image',
    context: {
      type: 'course' | 'module' | 'topic' | 'general';
      courseId?: string;
      moduleId?: string;
      topicId?: string;
    }
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('context', context.type);
      
      if (context.courseId) formData.append('course_id', context.courseId);
      if (context.moduleId) formData.append('module_id', context.moduleId);
      if (context.topicId) formData.append('topic_id', context.topicId);

      const response = await apiClient.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.warn('API not available, using mock upload:', error);
      // Fallback to mock upload for testing
      const { mockFileService } = await import('@/services/mockFileService');
      const mockFile = await mockFileService.uploadFile(file, type, context);
      return mockFile as FileUploadResponse;
    }
  }

  // Get files for specific context
  async getFiles(params: {
    courseId?: string;
    moduleId?: string;
    topicId?: string;
    context?: 'course' | 'module' | 'topic' | 'general';
  }): Promise<FileInfo[]> {
    try {
      const response = await apiClient.get('/api/files', { params });
      return response.data.data.files || [];
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      // Fallback to mock data for testing
      const { mockFileService } = await import('@/services/mockFileService');
      const mockFiles = await mockFileService.getFiles(params);
      return mockFiles as FileInfo[];
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    console.log('🗑️ Attempting to delete file:', fileId);
    try {
      console.log('📡 Calling backend API: DELETE /api/files/' + fileId);
      const response = await apiClient.delete(`/api/files/${fileId}`);
      console.log('✅ Backend delete successful:', response.data);
    } catch (error: any) {
      // Always fallback to mock delete for testing when backend is not available
      console.warn('⚠️ Backend API failed, using mock delete:', error?.message || error);
      console.log('🔄 Falling back to mock service...');
      const { mockFileService } = await import('@/services/mockFileService');
      await mockFileService.deleteFile(fileId);
      console.log('✅ Mock delete completed');
    }
  }

  // Get upload status
  async getUploadStatus(uploadId: string): Promise<UploadProgress> {
    const response = await apiClient.get(`/api/files/upload-status/${uploadId}`);
    return response.data.data;
  }

  // Update file metadata
  async updateFile(fileId: string, data: { filename?: string; type?: string }): Promise<FileInfo> {
    const response = await apiClient.put(`/api/files/${fileId}`, data);
    return response.data.data;
  }
}

export const lecturerService = new LecturerService();
