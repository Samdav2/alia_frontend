// Course-related API calls

export interface Course {
  id: string;
  code: string;
  title: string;
  progress?: number;
  instructor?: string;
  students?: number;
  modules?: number;
}

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await fetch(`/api/courses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  },

  async createCourse(courseData: Omit<Course, 'id'>): Promise<Course> {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to create course');
    return response.json();
  },

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) throw new Error('Failed to update course');
    return response.json();
  },

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete course');
  },
};
