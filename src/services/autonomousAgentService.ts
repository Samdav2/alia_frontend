// Autonomous Learning Agent Service
// Manages fully autonomous learning flow: course selection, progression, and completion

import { COURSES, getCourseTopics, getAllCourseIds, TOPICS, MODULES } from '@/data/courseData';
import { courseService, Course } from '@/services/api/courseService';
import { textToSpeechService } from './textToSpeechService';

export interface CourseProgress {
  courseId: string;
  topicsCompleted: string[];
  totalTopics: number;
  isCompleted: boolean;
  lastAccessedTopic: string | null;
}

export interface AgentState {
  isActive: boolean;
  currentCourse: string | null;
  currentTopic: string | null;
  status: string;
  progress: number;
  coursesCompleted: string[];
  totalCoursesAvailable: number;
}

class AutonomousAgentService {
  private state: AgentState = {
    isActive: false,
    currentCourse: null,
    currentTopic: null,
    status: 'Idle',
    progress: 0,
    coursesCompleted: [],
    totalCoursesAvailable: 0,
  };

  private listeners: Set<(state: AgentState) => void> = new Set();
  private voiceEnabled: boolean = true;
  private readingCompleteHandler: ((event: Event) => void) | null = null;

  // Enable/disable voice announcements
  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    textToSpeechService.setEnabled(enabled);
  }

  getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  // Subscribe to state changes
  subscribe(listener: (state: AgentState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // Get current state
  getState(): AgentState {
    return { ...this.state };
  }

  // Get progress data for external services
  getProgress() {
    const progress = this.loadProgress();
    const completedTopics: string[] = [];
    const completedCourses: string[] = [];
    let totalTimeSpent = 0;

    // Aggregate data from all courses
    progress.forEach((courseProgress) => {
      completedTopics.push(...courseProgress.topicsCompleted);
      totalTimeSpent += courseProgress.topicsCompleted.length * 15; // Estimate 15 min per topic

      if (courseProgress.isCompleted) {
        completedCourses.push(courseProgress.courseId);
      }
    });

    return {
      completedTopics,
      completedCourses,
      totalTimeSpent,
      currentCourse: this.state.currentCourse,
      currentTopic: this.state.currentTopic,
      isActive: this.state.isActive,
      progress: this.state.progress
    };
  }

  // Load user's course progress from localStorage
  private loadProgress(): Map<string, CourseProgress> {
    if (typeof window === 'undefined') return new Map(); // Skip on server-side

    const saved = localStorage.getItem('course-progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return new Map(Object.entries(data));
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    }
    return new Map();
  }

  // Save course progress
  private saveProgress(progress: Map<string, CourseProgress>) {
    if (typeof window === 'undefined') return; // Skip on server-side

    const data = Object.fromEntries(progress);
    localStorage.setItem('course-progress', JSON.stringify(data));
  }

  // Mark topic as completed
  markTopicCompleted(courseId: string, topicId: string) {
    const progress = this.loadProgress();
    const courseTopics = getCourseTopics(courseId);
    const totalTopics = courseTopics.length;

    const courseProgress = progress.get(courseId) || {
      courseId,
      topicsCompleted: [],
      totalTopics,
      isCompleted: false,
      lastAccessedTopic: null,
    };

    if (!courseProgress.topicsCompleted.includes(topicId)) {
      courseProgress.topicsCompleted.push(topicId);
    }
    courseProgress.lastAccessedTopic = topicId;
    courseProgress.totalTopics = totalTopics;
    courseProgress.isCompleted = courseProgress.topicsCompleted.length >= totalTopics;

    progress.set(courseId, courseProgress);
    this.saveProgress(progress);

    return courseProgress;
  }

  // Get next untaken course (prioritize provided list of courseIds if available)
  getNextUntakenCourse(courseIds?: string[]): string | null {
    const progress = this.loadProgress();
    const availableCourses = courseIds && courseIds.length > 0 ? courseIds : getAllCourseIds();

    for (const courseId of availableCourses) {
      const courseProgress = progress.get(courseId);
      if (!courseProgress || !courseProgress.isCompleted) {
        return courseId;
      }
    }

    return null; // All courses completed
  }

  // Get next topic in current course (optionally using a provided list of topic IDs)
  getNextTopic(courseId: string, topicIds?: string[]): string | null {
    const progress = this.loadProgress();
    const courseProgress = progress.get(courseId);

    const allTopicIds = topicIds && topicIds.length > 0
      ? topicIds
      : getCourseTopics(courseId).map(t => t.id);

    if (!courseProgress) {
      return allTopicIds[0] || null; // Start from first topic
    }

    for (const topicId of allTopicIds) {
      if (!courseProgress.topicsCompleted.includes(topicId)) {
        return topicId;
      }
    }

    return null; // Course completed
  }

  // Convert duration string to milliseconds (for realistic timing)
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)\s*min/);
    if (match) {
      const minutes = parseInt(match[1]);
      // Convert to seconds for demo (1 min = 3 seconds in demo)
      return minutes * 3000;
    }
    return 15000; // Default 15 seconds
  }

  // Start autonomous mode
  // Start autonomous mode (alias for start method)
  startAutonomousMode() {
    this.start();
  }

  async start() {
    this.state.isActive = true;
    this.state.status = 'Initializing autonomous learning agent...';
    // Load course list from backend to ensure we use real course IDs
    let backendCourses: Course[] = [];
    try {
      const coursesResp = await courseService.getAllCourses({ limit: 100 });
      backendCourses = coursesResp.courses;
    } catch (error) {
      console.warn('AutonomousAgentService: failed to load courses from backend', error);
    }
    const courseIds = backendCourses.map((c) => c.id);
    this.state.totalCoursesAvailable = courseIds.length || getAllCourseIds().length;
    this.notifyListeners();

    if (this.voiceEnabled) {
      // Attempt to prime speech synthesis for browser autoplay policies
      textToSpeechService.unlock();
      textToSpeechService.announce('Autonomous learning agent activated. Scanning for available courses.');
    }

    await new Promise(r => setTimeout(r, 2000));

    // Find next course to take
    const nextCourse = this.getNextUntakenCourse(courseIds);

    if (!nextCourse) {
      this.state.status = 'All courses completed! 🎉';
      this.state.isActive = false;
      this.notifyListeners();

      if (this.voiceEnabled) {
        textToSpeechService.announce('Congratulations! All courses have been completed. You have mastered the entire curriculum.');
      }

      return { completed: true, nextRoute: '/dashboard/student' };
    }

    const course = backendCourses.find((c) => c.id === nextCourse) || (COURSES as any)[nextCourse];
    this.state.currentCourse = nextCourse;
    this.state.status = `Course selected: ${course.code} - ${course.title}`;
    this.notifyListeners();

    if (this.voiceEnabled) {
      textToSpeechService.announce(`Course selected: ${course.code}, ${course.title}. Instructor: ${course.instructor}. Beginning first topic.`);
    }

    await new Promise(r => setTimeout(r, 2000));

    const topicList = await (async () => {
      try {
        const courseDetails = await courseService.getCourseDetails(nextCourse!);
        return courseDetails.modules.flatMap((m) => m.topics);
      } catch (error) {
        console.warn('AutonomousAgentService: failed to load course details for topic list', error);
        return [];
      }
    })();

    const nextTopic = this.getNextTopic(nextCourse, topicList.map(t => t.id));
    const topicData = topicList.find((t) => t.id === nextTopic) || (TOPICS as any)[nextTopic!];
    this.state.currentTopic = nextTopic;
    this.state.status = `Starting: ${topicData?.title || `Topic ${nextTopic}`}`;
    this.notifyListeners();

    return {
      completed: false,
      nextRoute: `/courses/${nextCourse}/topics/${nextTopic}`,
    };
  }

  // Process current topic (simulate reading/learning)
  async processTopic(courseId: string, topicId: string): Promise<{ nextRoute: string | null; completed: boolean }> {
    if (!this.state.isActive) {
      return { nextRoute: null, completed: false };
    }

    // Load course details from backend (fallback to static data)
    let currentTopic: any = null;
    let module: any = null;
    let course: any = null;
    try {
      const courseDetails = await courseService.getCourseDetails(courseId);
      course = courseDetails;
      const allTopics = courseDetails.modules.flatMap((m: any) => m.topics);
      currentTopic = allTopics.find((t: any) => t.id === topicId);
      module = courseDetails.modules.find((m: any) => m.id === (currentTopic?.module_id || currentTopic?.moduleId));
    } catch (error) {
      console.warn('AutonomousAgentService: failed to load course details; falling back to static data', error);
      course = (COURSES as any)[courseId];
      const courseTopics = getCourseTopics(courseId);
      currentTopic = courseTopics.find((t) => t.id === topicId);
      module = MODULES[(currentTopic as any)?.moduleId || ''];
    }

    this.state.status = `Now learning: ${currentTopic?.title || `Topic ${topicId}`}`;
    this.state.progress = 0;
    this.notifyListeners();

    // Get actual content for this topic
    let content = this.getTopicContent(topicId);
    try {
      const topicData = await courseService.getTopicDetails(courseId, topicId);
      if (topicData?.content) {
        content = topicData.content;
      }
    } catch (err) {
      // If API fails, fall back to built-in static content
      console.warn('AutonomousAgentService: Failed to load topic content from API, using fallback', err);
    }
    const actualReadingTime = textToSpeechService.calculateReadingTime(content);

    // Voice announcement for topic start
    if (this.voiceEnabled && currentTopic) {
      const moduleTitle = module?.title || 'Module';
      const readTimeMinutes = Math.ceil(actualReadingTime / 60);
      textToSpeechService.announce(`Now beginning ${currentTopic.title} from ${moduleTitle}. This topic will take approximately ${readTimeMinutes} minutes to complete. Starting content reading.`);
      await new Promise(r => setTimeout(r, 2000));
    }

    // Read the content aloud if voice is enabled
    if (this.voiceEnabled) {
      this.state.status = `Reading content: ${currentTopic?.title || `Topic ${topicId}`}`;
      this.notifyListeners();

      textToSpeechService.readContent(content);
      await textToSpeechService.waitForSpeech();
    }

    // Set up listener for when Read Aloud component finishes reading
    if (typeof window !== 'undefined') {
      await new Promise<void>((resolve) => {
        let lastSentenceTime = Date.now();

        const timeout = setTimeout(() => {
          console.log('Read aloud timeout, proceeding to next topic');
          resolve();
        }, 120000); // 120 second timeout

        const handler = (event: any) => {
          // Record when we received the completion event
          lastSentenceTime = Date.now();
          console.log('Read aloud completed, waiting for current sentence to finish...');

          // Wait additional 500ms to let current speech utterance finish
          setTimeout(() => {
            clearTimeout(timeout);
            (window as any).removeEventListener('topicReadingComplete', handler);
            console.log('Sentence completed, proceeding to next topic');
            resolve();
          }, 500);
        };

        (window as any).addEventListener('topicReadingComplete', handler, { once: true });
      });
    }

    // Use actual content length for progress simulation (but speed up for demo)
    const simulatedDuration = Math.min(actualReadingTime * 0.1, 30000); // Max 30 seconds for demo
    const progressInterval = simulatedDuration / 100; // 100 steps

    // Simulate learning progress based on actual content
    for (let i = 0; i <= 100; i += 2) {
      if (!this.state.isActive) {
        return { nextRoute: null, completed: false };
      }

      this.state.progress = i;
      this.state.status = `Processing: ${currentTopic?.title || `Topic ${topicId}`} - ${i}%`;
      this.notifyListeners();
      await new Promise(r => setTimeout(r, progressInterval * 2));
    }

    // Mark as completed
    const courseProgress = this.markTopicCompleted(courseId, topicId);

    this.state.status = `✓ Completed: ${currentTopic?.title || `Topic ${topicId}`}`;
    this.notifyListeners();

    if (this.voiceEnabled) {
      textToSpeechService.announce(`Excellent work! You have successfully completed ${currentTopic?.title}. Moving to the next topic.`);
    }

    await new Promise(r => setTimeout(r, 2000));

    // Check if course is completed
    if (courseProgress.isCompleted) {
      this.state.status = `🎓 Course completed: ${course.code} - ${course.title}`;
      if (!this.state.coursesCompleted.includes(courseId)) {
        this.state.coursesCompleted.push(courseId);
      }
      this.notifyListeners();

      if (this.voiceEnabled) {
        textToSpeechService.announce(`Outstanding achievement! You have completed the entire course: ${course.title}. This is a significant milestone in your learning journey. Preparing to start the next course.`);
      }

      await new Promise(r => setTimeout(r, 3000));

      // Find next course
      const nextCourse = this.getNextUntakenCourse();

      if (!nextCourse) {
        this.state.status = 'All courses completed! Returning to dashboard...';
        this.state.isActive = false;
        this.notifyListeners();

        if (this.voiceEnabled) {
          textToSpeechService.announce('Congratulations! You have achieved mastery of the entire curriculum. All courses have been completed successfully. You should be very proud of this accomplishment. Returning to your dashboard.');
        }

        return { nextRoute: '/dashboard/student', completed: true };
      }

      const nextCourseData = COURSES[nextCourse];
      this.state.currentCourse = nextCourse;
      this.state.status = `Next course: ${nextCourseData.code} - ${nextCourseData.title}`;
      this.notifyListeners();

      if (this.voiceEnabled) {
        textToSpeechService.announce(`Starting your next course: ${nextCourseData.code}, ${nextCourseData.title}. Your instructor will be ${nextCourseData.instructor}. Get ready for new learning adventures!`);
      }

      await new Promise(r => setTimeout(r, 2000));

      const nextTopic = this.getNextTopic(nextCourse);
      this.state.currentTopic = nextTopic;

      return {
        nextRoute: `/courses/${nextCourse}/topics/${nextTopic}`,
        completed: false,
      };
    }

    // Move to next topic in same course
    const nextTopic = this.getNextTopic(courseId);

    if (!nextTopic) {
      return { nextRoute: '/dashboard/student', completed: true };
    }

    const courseTopics = getCourseTopics(courseId);
    const nextTopicData = courseTopics.find((t: any) => t.id === nextTopic);
    const nextModule = MODULES[nextTopicData?.moduleId || ''];
    this.state.currentTopic = nextTopic;
    this.state.status = `Next: ${nextTopicData?.title || `Topic ${nextTopic}`}`;
    this.notifyListeners();

    // Check if we're moving to a new module
    const currentModule = MODULES[currentTopic?.moduleId || ''];
    if (nextModule && currentModule && nextModule.id !== currentModule.id) {
      if (this.voiceEnabled) {
        textToSpeechService.announce(`Great progress! You are now advancing to ${nextModule.title}. Your next topic is ${nextTopicData?.title}. This represents a new phase in your learning journey.`);
      }
    } else if (this.voiceEnabled) {
      textToSpeechService.announce(`Moving forward to your next topic: ${nextTopicData?.title}. Keep up the excellent work!`);
    }

    return {
      nextRoute: `/courses/${courseId}/topics/${nextTopic}`,
      completed: false,
    };
  }

  // Get topic content (same as ContentArea)
  private getTopicContent(topicId: string): string {
    const contentMap: Record<string, string> = {
      '1': `Introduction to Multi-Agent Systems: Multi-agent systems (MAS) represent a fundamental shift towards decentralized, autonomous intelligence in educational technology. These systems consist of multiple intelligent agents that interact with each other and their environment to achieve individual and collective goals. In the context of ALIA (Adaptive Learning Intelligence Assistant), we explore how distributed agents can work together to create personalized learning experiences. The foundation of MAS lies in the principle that complex problems can be solved more effectively through the collaboration of specialized agents rather than a single monolithic system. Each agent in ALIA has specific responsibilities: content curation, accessibility adaptation, assessment generation, and learning path optimization. This introduction covers the basic concepts, terminology, and architectural patterns that form the backbone of modern educational AI systems.`,

      '2': `Core Concepts of Agent Architecture: Understanding the core concepts of agent architecture is crucial for developing effective multi-agent educational systems. An agent is defined as an autonomous entity that perceives its environment through sensors and acts upon that environment through actuators. In ALIA's context, agents perceive student behavior, learning patterns, and performance data, then act by adapting content, suggesting resources, or modifying learning paths. Key properties of agents include autonomy (independent decision-making), reactivity (responding to environmental changes), proactivity (goal-directed behavior), and social ability (interaction with other agents). The architecture typically follows a layered approach: the reactive layer handles immediate responses to environmental changes, the deliberative layer manages goal-oriented planning, and the social layer facilitates communication and coordination with other agents. This multi-layered approach ensures that ALIA can respond quickly to student needs while maintaining long-term educational objectives.`,

      '3': `Practical Implementation and Case Studies: The practical implementation of multi-agent systems in educational environments requires careful consideration of real-world constraints and user needs. This section examines several case studies where MAS has been successfully deployed in learning management systems, adaptive tutoring platforms, and collaborative learning environments. We analyze the challenges faced during implementation, including agent coordination, conflict resolution, and system scalability. The case studies demonstrate how different agent types collaborate: content agents that curate and adapt learning materials, assessment agents that generate personalized quizzes and evaluations, accessibility agents that ensure content is available to users with diverse needs, and analytics agents that track learning progress and identify areas for improvement. Each case study provides insights into the design decisions, technical challenges, and lessons learned during deployment. We also explore the metrics used to evaluate system effectiveness, including learning outcomes, user satisfaction, and system performance indicators.`,

      '4': `Advanced Topics in Multi-Agent Coordination: Advanced coordination mechanisms are essential for managing complex interactions between multiple agents in educational systems. This deep dive explores sophisticated coordination protocols, negotiation strategies, and consensus algorithms that enable agents to work together effectively. We examine distributed problem-solving techniques where agents must coordinate their actions to achieve global educational objectives while maintaining their individual specializations. Topics include contract net protocols for task allocation, auction-based resource distribution, and collaborative filtering for content recommendation. The section also covers conflict resolution mechanisms when agents have competing objectives, such as when the accessibility agent's modifications conflict with the assessment agent's requirements. We explore machine learning approaches to coordination, including reinforcement learning for multi-agent environments and evolutionary algorithms for optimizing agent behaviors. Advanced topics also include fault tolerance, where the system continues to function even when individual agents fail, and dynamic agent creation and destruction based on changing educational needs.`,

      '5': `Case Studies and Real-World Applications: This comprehensive examination of real-world applications showcases how multi-agent systems have been successfully implemented in various educational contexts. We analyze large-scale deployments in universities, K-12 schools, and corporate training environments. Each case study provides detailed insights into the system architecture, agent roles and responsibilities, implementation challenges, and measurable outcomes. The studies cover diverse educational domains including STEM education, language learning, professional development, and special needs education. We examine how different institutions have adapted MAS principles to their specific requirements, cultural contexts, and technological constraints. The analysis includes quantitative results such as improved learning outcomes, reduced dropout rates, and increased student engagement, as well as qualitative feedback from educators and learners. We also explore the economic aspects of MAS implementation, including cost-benefit analyses, return on investment calculations, and long-term sustainability considerations. The case studies provide practical guidance for educators and technologists considering MAS adoption in their own contexts.`
    };

    return contentMap[topicId] || `Multi-agent systems (MAS) represent a shift towards decentralized, autonomous intelligence. In this chapter, we explore how ALIA's core agents—Content, Access, and Assessment—synchronize to create a personalized learning trajectory for every student. We focus specifically on the heuristic feedback loops that allow the system to adapt in real-time.`;
  }

  // Stop autonomous mode
  stop() {
    this.state.isActive = false;
    this.state.status = 'Autonomous mode deactivated';
    this.state.progress = 0;
    this.notifyListeners();

    // Stop any ongoing speech
    textToSpeechService.stop();

    if (this.voiceEnabled) {
      textToSpeechService.announce('Autonomous learning mode has been deactivated. You can resume manually or restart autonomous mode later.');
    }
  }

  // Reset all progress (for testing)
  resetProgress() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('course-progress');
    }
    this.state.coursesCompleted = [];
    this.state.currentCourse = null;
    this.state.currentTopic = null;
    this.state.progress = 0;
    this.state.status = 'Progress reset';
    this.notifyListeners();
  }

  // Reset specific course progress
  resetCourseProgress(courseId: string) {
    const progress = this.loadProgress();
    progress.delete(courseId);
    this.saveProgress(progress);

    // Update state if this was the current course
    if (this.state.currentCourse === courseId) {
      this.state.currentCourse = null;
      this.state.currentTopic = null;
      this.state.progress = 0;
    }

    // Remove from completed courses
    this.state.coursesCompleted = this.state.coursesCompleted.filter(id => id !== courseId);
    this.notifyListeners();
  }

  // Get detailed progress statistics
  getProgressStats() {
    const progress = this.loadProgress();
    const totalCourses = getAllCourseIds().length;
    const completedCourses = Array.from(progress.values()).filter(p => p.isCompleted).length;
    const totalTopics = getAllCourseIds().reduce((sum, courseId) => {
      return sum + getCourseTopics(courseId).length;
    }, 0);
    const completedTopics = Array.from(progress.values()).reduce((sum, p) => {
      return sum + (p.topicsCompleted?.length || 0);
    }, 0);

    return {
      totalCourses,
      completedCourses,
      totalTopics,
      completedTopics,
      progressPercentage: Math.round((completedTopics / totalTopics) * 100),
      courseProgressPercentage: Math.round((completedCourses / totalCourses) * 100)
    };
  }
}

export const autonomousAgentService = new AutonomousAgentService();
