import apiClient from '@/lib/apiClient';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: QuizOption[];
  correct_answer?: string; // Only included for lecturers
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  time_limit: number;
  passing_score: number;
  max_attempts: number;
  is_active: boolean;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string;
  time_taken: number;
}

export interface QuizSubmission {
  quiz_id: string;
  answers: Record<string, string>;
  time_taken: number;
}

export interface QuizResults {
  attempt_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  feedback: Array<{
    question_id: string;
    correct: boolean;
    your_answer: string;
    correct_answer: string;
    explanation: string;
  }>;
}

export interface QuizInfo {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  max_attempts: number;
  attempts_taken: number;
  attempts_remaining: number;
  best_score?: number;
  has_quiz: boolean;
}

class QuizService {
  // Student endpoints
  async getQuizInfo(courseId: string, topicId: string): Promise<QuizInfo | null> {
    try {
      const response = await apiClient.get(`/courses/${courseId}/topics/${topicId}/quiz/info`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No quiz for this topic
      }
      throw error;
    }
  }

  async getQuiz(courseId: string, topicId: string): Promise<Quiz> {
    const response = await apiClient.get(`/courses/${courseId}/topics/${topicId}/quiz`);
    return response.data.data;
  }

  async submitQuiz(courseId: string, topicId: string, submission: QuizSubmission): Promise<QuizResults> {
    const response = await apiClient.post(`/courses/${courseId}/topics/${topicId}/quiz/submit`, submission);
    return response.data.data;
  }

  async getAttempts(courseId: string, topicId: string): Promise<{ attempts: QuizAttempt[]; best_score: number; attempts_remaining: number }> {
    const response = await apiClient.get(`/courses/${courseId}/topics/${topicId}/quiz/attempts`);
    return response.data.data;
  }
}

export const quizService = new QuizService();
