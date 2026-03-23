// Enrollment API Service - Backend Integration
import apiClient from '@/lib/apiClient';

export interface EnrollmentResponse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'dropped';
  progress_percentage: number;
}

export interface EnrollmentRequest {
  course_id: string;
}

class EnrollmentAPIService {
  // Enroll in a course
  async enrollInCourse(courseId: string): Promise<EnrollmentResponse> {
    const response = await apiClient.post('/api/enrollments', {
      course_id: courseId
    });
    return response.data.data;
  }

  // Unenroll from a course
  async unenrollFromCourse(courseId: string): Promise<void> {
    await apiClient.delete(`/api/enrollments/${courseId}`);
  }

  // Get user's enrollments
  async getUserEnrollments(): Promise<EnrollmentResponse[]> {
    const response = await apiClient.get('/api/enrollments');
    return response.data.data.enrollments;
  }

  // Check if user is enrolled in a specific course
  async isEnrolledInCourse(courseId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/api/enrollments/${courseId}`);
      return response.data.data.is_enrolled;
    } catch (err) {
      // If endpoint doesn't exist, fall back to checking enrollment list
      try {
        const enrollments = await this.getUserEnrollments();
        return enrollments.some(enrollment => enrollment.course_id === courseId);
      } catch {
        return false;
      }
    }
  }
}

export const enrollmentAPIService = new EnrollmentAPIService();