// Enrollment Service
// Manages course enrollment status and permissions

export interface EnrollmentStatus {
  courseId: string;
  isEnrolled: boolean;
  enrollmentDate?: Date;
  status: 'enrolled' | 'not_enrolled' | 'pending';
}

class EnrollmentService {
  private enrollments: Map<string, EnrollmentStatus> = new Map();

  constructor() {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      this.loadEnrollments();
    }
  }

  // Load enrollments from localStorage
  private loadEnrollments() {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    const saved = localStorage.getItem('course-enrollments');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.enrollments = new Map(Object.entries(data));
      } catch (e) {
        console.error('Failed to load enrollments', e);
      }
    }
  }

  // Save enrollments to localStorage
  private saveEnrollments() {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    const data = Object.fromEntries(this.enrollments);
    localStorage.setItem('course-enrollments', JSON.stringify(data));
  }

  // Check if user is enrolled in a course
  isEnrolled(courseId: string): boolean {
    const enrollment = this.enrollments.get(courseId);
    return enrollment?.isEnrolled || false;
  }

  // Get enrollment status
  getEnrollmentStatus(courseId: string): EnrollmentStatus {
    return this.enrollments.get(courseId) || {
      courseId,
      isEnrolled: false,
      status: 'not_enrolled'
    };
  }

  // Enroll in a course
  enrollInCourse(courseId: string): boolean {
    try {
      const enrollment: EnrollmentStatus = {
        courseId,
        isEnrolled: true,
        enrollmentDate: new Date(),
        status: 'enrolled'
      };
      
      this.enrollments.set(courseId, enrollment);
      this.saveEnrollments();
      return true;
    } catch (e) {
      console.error('Failed to enroll in course', e);
      return false;
    }
  }

  // Unenroll from a course (for testing)
  unenrollFromCourse(courseId: string): boolean {
    try {
      this.enrollments.delete(courseId);
      this.saveEnrollments();
      return true;
    } catch (e) {
      console.error('Failed to unenroll from course', e);
      return false;
    }
  }

  // Get all enrollments
  getAllEnrollments(): EnrollmentStatus[] {
    return Array.from(this.enrollments.values());
  }
}

export const enrollmentService = new EnrollmentService();