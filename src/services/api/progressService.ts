// Progress Tracking Service - Backend API Integration
import apiClient from '@/lib/apiClient';

export interface TopicProgress {
  id: string;
  user_id: string;
  topic_id: string;
  enrollment_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  time_spent: number;
  last_accessed: string;
  completed_at?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  time_taken: number;
  answers: any[];
  attempted_at: string;
}

export interface ProgressSummary {
  enrollment_id: string;
  course_id: string;
  total_topics: number;
  completed_topics: number;
  progress_percentage: number;
  total_time_spent: number;
  average_quiz_score: number;
  last_activity: string;
}

class ProgressService {
  // Record topic progress
  async recordTopicProgress(data: {
    course_id: string;
    topic_id: string;
    status: 'in_progress' | 'completed';
    time_spent?: number;
    score?: number;
  }): Promise<TopicProgress> {
    const response = await apiClient.post(`/api/progress/${data.course_id}/topics/${data.topic_id}`, {
      status: data.status,
      time_spent: data.time_spent || 0,
      score: data.score || 0
    });
    return response.data.data;
  }

  // Get course progress
  async getCourseProgress(courseId: string): Promise<any> {
    const response = await apiClient.get(`/api/progress/${courseId}`);
    return response.data.data;
  }

  // Submit quiz attempt (placeholder - not in current API)
  async submitQuizAttempt(data: {
    topic_id: string;
    answers: any[];
    time_taken: number;
  }): Promise<QuizAttempt> {
    // This endpoint doesn't exist in current API, return mock data
    return {
      id: Date.now().toString(),
      user_id: 'current-user',
      topic_id: data.topic_id,
      score: 85,
      total_questions: data.answers.length,
      time_taken: data.time_taken,
      answers: data.answers,
      attempted_at: new Date().toISOString()
    };
  }

  // Reset course progress (placeholder - not in current API)
  async resetCourseProgress(courseId: string): Promise<void> {
    // This endpoint doesn't exist in current API yet
    // For now, we'll just return success and let the frontend handle localStorage reset
    console.log(`Reset progress for course ${courseId} - API endpoint not implemented yet`);
    return Promise.resolve();
  }

  // Get progress summary (placeholder - not in current API)
  async getProgressSummary(courseId: string): Promise<ProgressSummary> {
    // Use course progress endpoint instead
    const progress = await this.getCourseProgress(courseId);
    return {
      enrollment_id: courseId,
      course_id: courseId,
      total_topics: progress.total_topics || 0,
      completed_topics: progress.completed_topics || 0,
      progress_percentage: progress.progress_percentage || 0,
      total_time_spent: progress.total_time_spent || 0,
      average_quiz_score: progress.average_quiz_score || 0,
      last_activity: progress.last_activity || new Date().toISOString()
    };
  }
}

export const progressService = new ProgressService();
