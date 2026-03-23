// System Control Service
// Provides voice chat with full system access and control

import { enrollmentService } from './enrollmentService';
import { autonomousAgentService } from './autonomousAgentService';
import { textToSpeechService } from './textToSpeechService';
import { courseService } from './api/courseService';

export interface SystemAction {
  type: 'navigate' | 'enroll' | 'start_course' | 'take_quiz' | 'start_autonomous' | 'change_settings' | 'show_progress';
  description: string;
  execute: () => Promise<string>;
}

export interface UserContext {
  currentPage: string;
  enrolledCourses: string[];
  completedTopics: string[];
  currentCourse?: string;
  currentTopic?: string;
  preferences: {
    language: string;
    voiceEnabled: boolean;
    autonomousMode: boolean;
  };
  performance: {
    totalTimeSpent: number;
    coursesCompleted: number;
    averageScore: number;
  };
}

class SystemControlService {
  private userContext: UserContext;

  constructor() {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      this.userContext = this.loadUserContext();
    } else {
      // Provide default context for server-side
      this.userContext = {
        currentPage: '/',
        enrolledCourses: [],
        completedTopics: [],
        preferences: {
          language: 'English',
          voiceEnabled: true,
          autonomousMode: false
        },
        performance: {
          totalTimeSpent: 0,
          coursesCompleted: 0,
          averageScore: 0
        }
      };
    }
  }

  // Load user context from various sources
  private loadUserContext(): UserContext {
    // Skip localStorage access on server-side
    if (typeof window === 'undefined') {
      return {
        currentPage: '/',
        enrolledCourses: [],
        completedTopics: [],
        preferences: {
          language: 'English',
          voiceEnabled: true,
          autonomousMode: false
        },
        performance: {
          totalTimeSpent: 0,
          coursesCompleted: 0,
          averageScore: 0
        }
      };
    }

    // Get enrolled courses from API or localStorage fallback
    let enrolledCourseIds: string[] = [];
    
    // Try to get from localStorage first (for immediate availability)
    const enrollments = localStorage.getItem('enrollments');
    if (enrollments) {
      try {
        enrolledCourseIds = JSON.parse(enrollments);
      } catch (e) {
        console.error('Failed to parse enrollments from localStorage:', e);
      }
    }

    // Also try to get from enrollmentService if available
    try {
      const enrollmentData = enrollmentService.getAllEnrollments();
      const activeEnrollments = enrollmentData.filter(e => e.isEnrolled).map(e => e.courseId);
      if (activeEnrollments.length > 0) {
        enrolledCourseIds = activeEnrollments;
      }
    } catch (e) {
      console.error('Failed to get enrollments from service:', e);
    }

    const autonomousProgress = autonomousAgentService.getProgress();

    return {
      currentPage: window.location.pathname,
      enrolledCourses: enrolledCourseIds,
      completedTopics: autonomousProgress?.completedTopics || [],
      currentCourse: autonomousProgress?.currentCourse ?? undefined,
      currentTopic: autonomousProgress?.currentTopic ?? undefined,
      preferences: {
        language: localStorage.getItem('voice-language') ?? 'English',
        voiceEnabled: localStorage.getItem('voice-enabled') !== 'false',
        autonomousMode: localStorage.getItem('autonomous-mode') === 'true'
      },
      performance: {
        totalTimeSpent: autonomousProgress?.totalTimeSpent || 0,
        coursesCompleted: autonomousProgress?.completedCourses?.length || 0,
        averageScore: 85 // Mock data
      }
    };
  }

  // Update user context
  updateContext() {
    if (typeof window !== 'undefined') {
      this.userContext = this.loadUserContext();
    }
  }

  // Get current user context
  getUserContext(): UserContext {
    return this.userContext;
  }

  // Generate system prompt with full context
  generateSystemPrompt(): string {
    const context = this.getUserContext();

    return `You are ALIA, an advanced AI learning assistant with FULL SYSTEM ACCESS. You can control the entire learning platform.

CURRENT USER CONTEXT:
- Current Page: ${context.currentPage}
- Enrolled Courses: ${context.enrolledCourses.length} courses
- Completed Topics: ${context.completedTopics.length} topics
- Current Course: ${context.currentCourse || 'None'}
- Current Topic: ${context.currentTopic || 'None'}
- Language: ${context.preferences.language}
- Autonomous Mode: ${context.preferences.autonomousMode ? 'Active' : 'Inactive'}
- Total Study Time: ${Math.floor(context.performance.totalTimeSpent / 60)} minutes
- Courses Completed: ${context.performance.coursesCompleted}
- Average Score: ${context.performance.averageScore}%

SYSTEM CAPABILITIES - YOU CAN:
1. Navigate to any page (courses, profile, chat, voice chat)
2. Enroll users in courses instantly
3. Start courses and specific topics
4. Activate autonomous learning mode
5. Generate and start quizzes
6. Change user preferences and settings
7. Show detailed progress reports
8. Control voice and accessibility features
9. Access all course content and materials
10. Manage learning schedules and reminders

BEHAVIORAL GUIDELINES:
- Be proactive and suggest specific actions
- Always offer to DO things, not just explain them
- Use the user's current context to make relevant suggestions
- If user seems stuck or confused, take immediate action to help
- Speak naturally and conversationally
- Reference specific courses, topics, and progress data
- Always end responses with actionable next steps

RESPONSE FORMAT:
1. Acknowledge what the user said
2. Provide contextual response based on their situation
3. Suggest 2-3 specific actions you can take RIGHT NOW
4. Ask which action they'd prefer, or take the most logical action

NIGERIAN CONTEXT:
- Understand Nigerian educational system and culture
- Use appropriate Nigerian English expressions
- Be aware of common challenges Nigerian students face
- Reference local context when relevant

Remember: You have FULL CONTROL of the system. Don't just talk - ACT!`;
  }

  // Generate available actions based on context
  generateAvailableActions(userInput: string): SystemAction[] {
    const context = this.getUserContext();
    const actions: SystemAction[] = [];
    const lowerInput = userInput.toLowerCase();

    // Navigation actions
    if (lowerInput.includes('course') || lowerInput.includes('learn')) {
      actions.push({
        type: 'navigate',
        description: 'Go to course marketplace',
        execute: async () => {
          window.location.href = '/dashboard/student/courses';
          return 'Navigating to course marketplace where you can explore and enroll in courses.';
        }
      });
    }

    // Enrollment actions
    if (lowerInput.includes('enroll') || lowerInput.includes('join')) {
      actions.push({
        type: 'enroll',
        description: 'Enroll in recommended course',
        execute: async () => {
          try {
            // Get available courses first to find a suitable course UUID
            const availableCourses = await courseService.getAllCourses({ limit: 1 });
            if (availableCourses.courses.length > 0) {
              const courseId = availableCourses.courses[0].id; // Use actual UUID
              const success = enrollmentService.enrollInCourse(courseId);
              if (success) {
                return `Successfully enrolled you in ${availableCourses.courses[0].title}! You can start learning immediately.`;
              }
            }
            return 'No courses available for enrollment at the moment.';
          } catch (error) {
            console.error('Error during enrollment:', error);
            return 'Enrollment failed. Let me try a different approach.';
          }
        }
      });
    }

    // Course starting actions
    if (lowerInput.includes('start') || lowerInput.includes('begin')) {
      if (context.enrolledCourses.length > 0) {
        actions.push({
          type: 'start_course',
          description: 'Start your enrolled course',
          execute: async () => {
            const courseId = context.enrolledCourses[0];
            // Try to get the first topic ID
            const firstTopicId = await this.getFirstTopicId(courseId);
            if (firstTopicId) {
              window.location.href = `/courses/${courseId}/topics/${firstTopicId}`;
              return `Starting your course! Taking you to the first lesson now.`;
            } else {
              // Fallback to course overview
              window.location.href = `/courses/${courseId}`;
              return `Starting your course! Taking you to your course overview.`;
            }
          }
        });
      }
    }

    // Autonomous mode actions
    if (lowerInput.includes('autonomous') || lowerInput.includes('auto') || lowerInput.includes('guide')) {
      actions.push({
        type: 'start_autonomous',
        description: 'Activate autonomous learning mode',
        execute: async () => {
          autonomousAgentService.startAutonomousMode();
          return 'Autonomous learning mode activated! I\'ll now guide you through your courses automatically.';
        }
      });
    }

    // Progress actions
    if (lowerInput.includes('progress') || lowerInput.includes('performance') || lowerInput.includes('how am i')) {
      actions.push({
        type: 'show_progress',
        description: 'Show detailed progress report',
        execute: async () => {
          return `Here's your progress: You've completed ${context.completedTopics.length} topics, spent ${Math.floor(context.performance.totalTimeSpent / 60)} minutes studying, and have an average score of ${context.performance.averageScore}%. You're doing great!`;
        }
      });
    }

    // Quiz actions
    if (lowerInput.includes('quiz') || lowerInput.includes('test') || lowerInput.includes('assessment')) {
      actions.push({
        type: 'take_quiz',
        description: 'Generate and start a quiz',
        execute: async () => {
          // Navigate to a course with quiz capability
          window.location.href = '/dashboard/student/courses';
          return 'I\'ve prepared a personalized quiz for you! Let\'s test your knowledge on your current topics.';
        }
      });
    }

    // Settings actions
    if (lowerInput.includes('setting') || lowerInput.includes('preference') || lowerInput.includes('language')) {
      actions.push({
        type: 'change_settings',
        description: 'Open settings and preferences',
        execute: async () => {
          window.location.href = '/dashboard/student/profile';
          return 'Opening your profile settings where you can customize your learning preferences.';
        }
      });
    }

    return actions;
  }

  // Execute system action
  async executeAction(action: SystemAction): Promise<string> {
    try {
      const result = await action.execute();
      this.updateContext(); // Refresh context after action
      return result;
    } catch (error) {
      console.error('System action failed:', error);
      return 'I encountered an issue executing that action. Let me try a different approach.';
    }
  }

  // Execute a raw action (from AI response)
  async executeRawAction(action: { type: string, description: string, data?: any }): Promise<string> {
    const type = action.type;
    const data = action.data || {};

    console.log(`🛠️ Executing raw action: ${type}`, data);

    try {
      switch (type) {
        case 'enroll':
        case 'start_course':
          try {
            let courseId = data.courseId;
            
            // If no specific course ID provided, get the first available course
            if (!courseId || courseId === 'suggested' || courseId === '1') {
              const availableCourses = await courseService.getAllCourses({ limit: 1 });
              if (availableCourses.courses.length > 0) {
                courseId = availableCourses.courses[0].id; // Use actual UUID
              } else {
                return 'No courses available for enrollment at the moment.';
              }
            }

            const success = enrollmentService.enrollInCourse(courseId);
            if (success) {
              // Try to get the first topic ID for proper navigation
              try {
                const firstTopicId = await this.getFirstTopicId(courseId);
                if (firstTopicId && typeof window !== 'undefined') {
                  window.location.href = `/courses/${courseId}/topics/${firstTopicId}`;
                } else if (typeof window !== 'undefined') {
                  window.location.href = `/courses/${courseId}`;
                }
                return `Successfully enrolled in and started course ${courseId}.`;
              } catch (error) {
                // Fallback to course overview
                if (typeof window !== 'undefined') {
                  window.location.href = `/courses/${courseId}`;
                }
                return `Successfully enrolled in course ${courseId}.`;
              }
            }
            return `Failed to enroll in course ${courseId}.`;
          } catch (error) {
            console.error('Error in enroll/start_course action:', error);
            return 'Failed to process enrollment request.';
          }

        case 'navigate':
          const dest = data.destination || '/dashboard/student/courses';
          if (typeof window !== 'undefined') {
            window.location.href = dest;
          }
          return `Navigated to ${dest}.`;

        case 'start_autonomous':
          autonomousAgentService.startAutonomousMode();
          return 'Autonomous learning mode activated.';

        case 'take_quiz':
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard/student/courses';
          }
          return 'Redirecting to your courses for the personalized quiz.';

        case 'show_progress':
          const context = this.getUserContext();
          return `Your average score is ${context.performance.averageScore}% with ${context.completedTopics.length} topics completed.`;

        default:
          return `Action type ${type} is not yet supported for direct execution.`;
      }
    } catch (error) {
      console.error('Error in executeRawAction:', error);
      throw error;
    }
  }

  // Get contextual response with actions
  async getContextualResponse(userInput: string): Promise<{
    response: string;
    actions: SystemAction[];
    autoExecute?: SystemAction;
  }> {
    const context = this.getUserContext();
    const actions = this.generateAvailableActions(userInput);
    const lowerInput = userInput.toLowerCase();

    let response = '';
    let autoExecute: SystemAction | undefined;

    // Analyze user intent and provide contextual response
    if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes('confused')) {
      response = `I can see you need guidance! Based on your current progress (${context.completedTopics.length} topics completed), let me help you get back on track. `;

      if (context.enrolledCourses.length === 0) {
        response += `First, let's get you enrolled in a course that matches your interests.`;
        autoExecute = actions.find(a => a.type === 'enroll');
      } else if (context.currentCourse) {
        response += `You're currently working on ${context.currentCourse}. Let's continue from where you left off.`;
        autoExecute = actions.find(a => a.type === 'start_course');
      }
    }

    else if (lowerInput.includes('course') || lowerInput.includes('learn') || lowerInput.includes('study')) {
      if (context.enrolledCourses.length === 0) {
        response = `Perfect! Let's get you started with learning. I can enroll you in our most popular course right now, or take you to browse all available courses. `;
        autoExecute = actions.find(a => a.type === 'navigate');
      } else {
        response = `Great! You're enrolled in ${context.enrolledCourses.length} course(s). Let's continue your learning journey. `;
        autoExecute = actions.find(a => a.type === 'start_course');
      }
    }

    else if (lowerInput.includes('progress') || lowerInput.includes('how am i')) {
      response = `Let me show you exactly how you're doing! `;
      autoExecute = actions.find(a => a.type === 'show_progress');
    }

    else if (lowerInput.includes('quiz') || lowerInput.includes('test')) {
      response = `Excellent idea! Testing yourself is one of the best ways to learn. Let me create a personalized quiz based on your current progress. `;
      autoExecute = actions.find(a => a.type === 'take_quiz');
    }

    else if (lowerInput.includes('autonomous') || lowerInput.includes('guide me')) {
      response = `Perfect! I'll activate autonomous mode and guide you through your entire learning journey step by step. `;
      autoExecute = actions.find(a => a.type === 'start_autonomous');
    }

    else {
      // Default contextual response
      response = `I understand you want to ${userInput}. Based on your current situation, here's what I can do for you right now: `;
    }

    return {
      response,
      actions,
      autoExecute
    };
  }

  // Check if user is currently speaking (for better interruption handling)
  isUserSpeaking(): boolean {
    // This would integrate with speech recognition to detect ongoing speech
    return false; // Placeholder
  }

  // Get smart suggestions based on current context
  getSmartSuggestions(): string[] {
    const context = this.getUserContext();
    const suggestions: string[] = [];

    if (context.enrolledCourses.length === 0) {
      suggestions.push('Enroll in a course to start learning');
      suggestions.push('Browse available courses');
    } else {
      suggestions.push('Continue your current course');
      suggestions.push('Take a practice quiz');
    }

    if (!context.preferences.autonomousMode) {
      suggestions.push('Activate autonomous learning mode');
    }

    suggestions.push('Check your learning progress');
    suggestions.push('Adjust your preferences');

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Helper function to get first topic ID from a course
  async getFirstTopicId(courseId: string): Promise<string | null> {
    try {
      const courseDetails = await courseService.getCourseDetails(courseId);
      if (courseDetails.modules && courseDetails.modules.length > 0) {
        const firstModule = courseDetails.modules[0];
        if (firstModule.topics && firstModule.topics.length > 0) {
          return firstModule.topics[0].id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting first topic ID:', error);
      return null;
    }
  }
}

export const systemControlService = new SystemControlService();
