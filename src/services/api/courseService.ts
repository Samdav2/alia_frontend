// Course Service - Backend API Integration
import apiClient from '@/lib/apiClient';

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor: string;
  instructor_id: string;
  department: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  enrollment_count: number;
  rating: number;
  tags: string[];
  thumbnail: string;
  is_active: boolean;
  is_enrolled?: boolean; // New field from backend
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
}

export interface Topic {
  id: string;
  module_id: string;
  title: string;
  description: string;
  content: string;
  content_type: 'text' | 'video' | 'interactive';
  order: number;
  duration: number;
  resources: any[];
}

export interface CourseDetails extends Course {
  modules: (Module & { topics: Topic[] })[];
}

export interface CoursesListResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

class CourseService {
  // Get all courses
  async getAllCourses(params?: {
    page?: number;
    limit?: number;
    department?: string;
    level?: string;
    search?: string;
  }): Promise<CoursesListResponse> {
    const response = await apiClient.get('/api/courses', { params });
    return response.data.data;
  }

  // Get course details
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    if (!courseId || courseId === 'undefined') {
      throw new Error('Course ID is required');
    }
    const response = await apiClient.get(`/api/courses/${courseId}`);
    return response.data.data;
  }

  // Get course modules
  async getCourseModules(courseId: string): Promise<Module[]> {
    if (!courseId || courseId === 'undefined') {
      throw new Error('Course ID is required');
    }
    const response = await apiClient.get(`/api/courses/${courseId}/modules`);
    return response.data.data.modules;
  }

  // Get topic details
  async getTopicDetails(courseId: string, topicId: string): Promise<Topic> {
    if (!courseId || courseId === 'undefined' || !topicId || topicId === 'undefined') {
      throw new Error('Course ID and Topic ID are required');
    }
    const response = await apiClient.get(`/api/courses/${courseId}/topics/${topicId}`);
    return response.data.data;
  }
}

export const courseService = new CourseService();
