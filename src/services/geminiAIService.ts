// Gemini AI Service for Agentic Voice Chat
// Provides client-side Gemini API interaction with dynamic course context and teacher persona

import { courseService, Course } from '@/services/api/courseService';

interface GeminiAIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AgenticResponse {
  response: string;
  suggestions: string[];
  actions: AgenticAction[];
  nextSteps: string[];
  confidence: number;
}

interface AgenticAction {
  type: 'navigate' | 'start_course' | 'take_quiz' | 'review_topic' | 'set_reminder' | 'enroll';
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface UserContext {
  studentName?: string;
  currentCourse?: string;
  completedTopics: string[];
  enrolledCourses?: string[];
  learningGoals: string[];
  preferences: {
    language: string;
    learningStyle: string;
    difficulty: string;
  };
  performance: {
    averageScore: number;
    timeSpent: number;
    strugglingTopics: string[];
  };
}

class GeminiAIService {
  private config: GeminiAIConfig;
  private conversationHistory: ChatMessage[] = [];
  private userContext: UserContext | null = null;
  private courses: Course[] = [];

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-1.5-flash'
    };
  }

  // Set Gemini API key
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  // Update user context for personalized responses
  updateUserContext(context: Partial<UserContext>) {
    this.userContext = { ...this.userContext, ...context } as UserContext;
  }

  // Fetch courses dynamically if needed
  async fetchCoursesIfNeeded() {
    if (this.courses.length === 0) {
      try {
        const response = await courseService.getAllCourses();
        if (response && response.courses) {
          this.courses = response.courses;
          console.log('📚 Gemini AI Service loaded courses dynamically:', this.courses.map(c => c.title));
        }
      } catch (e) {
        console.error('❌ Error fetching courses in geminiAIService:', e);
      }
    }
  }

  // Generate system prompt for agentic behavior
  private generateSystemPrompt(courseDetailsText: string = ''): string {
    const coursesStr = this.courses.length > 0
      ? this.courses.map((c, idx) => `${idx + 1}. ${c.title} (ID: ${c.id}, Code: ${c.code}) - ${c.description || 'No description'}`).join('\n')
      : '1. Multi-Agent Systems (ID: 1, Code: MAS) - Advanced AI course\n2. Educational Psychology (ID: 2, Code: EDP) - Learning theory\n3. Curriculum Development (ID: 3, Code: CD) - Course design\n4. Software Engineering (ID: 4, Code: SE) - Programming practices';

    const contextInfo = this.userContext ? `
CURRENT USER CONTEXT:
- Student Name: ${this.userContext.studentName || 'Not known yet - politely ask for their name in your first reply to build connection.'}
- Current Page: ${this.userContext.currentCourse ? `/courses/${this.userContext.currentCourse}` : 'Dashboard'}
- Current Course: ${this.userContext.currentCourse || 'None - User needs to enroll'}
- Completed Topics: ${this.userContext.completedTopics.length} topics completed
- Learning Style: ${this.userContext.preferences?.learningStyle || 'Visual learner'}
- Language Preference: ${this.userContext.preferences?.language || 'English'}
- Average Score: ${this.userContext.performance?.averageScore || 0}%
- Time Spent Learning: ${Math.floor((this.userContext.performance?.timeSpent || 0) / 60)} minutes
- Struggling Areas: ${this.userContext.performance?.strugglingTopics?.join(', ') || 'None identified yet'}

AVAILABLE COURSES FROM DATABASE:
${coursesStr}
${courseDetailsText}

ENROLLMENT STATUS:
- Currently Enrolled Courses: ${this.userContext.enrolledCourses && this.userContext.enrolledCourses.length > 0 ? `Yes, enrolled in course IDs: ${this.userContext.enrolledCourses.join(', ')}` : 'No enrollments found. Politely offer to enroll the user in a course immediately.'}
` : 'No user context available - gathering information...';

    return `You are ALIA (Adaptive Learning Intelligence Assistant), a warm, supportive, and patient AI teacher sitting next to a student. You have FULL SYSTEM ACCESS and can take IMMEDIATE ACTION.

🎯 CORE OBJECTIVES:
1. **Teacher Persona (Accessibility Focus)**: Speak like a patient, calm, and extremely caring mentor sitting right next to the student. Explain complex academic concepts in simple, clear, and structured terms. Since the student is blind or has learning challenges, be descriptive and explain concepts step-by-step. Do not use long blocks of text.
2. **Proactive Personalization**: Ask for the student's name if you don't know it, and actively refer to them by their name frequently to build a strong connection.
3. **No Pidgin English**: You are a warm Nigerian mentor, but you must speak in correct, clear, and professional standard English. Do NOT use Pidgin English (e.g., do NOT say "you dey try", "make we", "I go help you", etc.). You can use polite Nigerian English greetings or respect markers, but keep all explanations grammatically correct and standard.
4. **Dynamic Explanation & Real-World Scenarios**: If asked about any subject (e.g., general studies, Educational Psychology, Curriculum Development), dynamically fetch the topics, load them into context, and explain them thoroughly using rich scenarios, real-world analogies, and stories. Do not perform page navigation.
5. **Interactive Check-ins**: Ask checking questions continuously. After explaining a concept, ask: "Does that make sense, [Name]?" or "Here is a quick question to test our understanding: ...". Keep the dialogue highly interactive.

\${contextInfo}

💪 YOUR AGENTIC POWERS:
- **Enrollment**: You can enroll users in courses. Proactively mention course names and offer to enroll them.
- **Navigation**: Move users to specific topics or pages.
- **Autonomous Mode**: Activate continuous, guided learning sessions.
- **Diagnostics**: Generate quizzes and analyze learning gaps.

🗣️ GUIDELINES:
- **Calm and Reassuring**: Keep your tone reassuring, structured, and patient.
- **Vocabulary Sophistication**: Strictly avoid repetitive, overused filler words like "delighted", "thrilled", "excited", "absolutely", "happy to help", "let's dive in", or "great job". Use a sophisticated, diverse, and creative vocabulary. Express warmth and care through tone and structured, pedagogical guidance rather than canned enthusiastic phrases.
- **Vivid Descriptions**: Describe things visually and structurally so blind students can grasp them easily.
- **Dynamic Curriculum Knowledge**: Refer to the course database details loaded below to explain actual topics dynamically.
- **No Page Redirections**: Provide the explanations verbally and contextually instead of redirecting the user to different pages.

Remember: You are the student's companion and guide. Be warm, standard in English, and highly interactive!`;
  }

  // Generate agentic AI response using Gemini
  async generateAgenticResponse(userInput: string): Promise<AgenticResponse> {
    try {
      await this.fetchCoursesIfNeeded();

      // Check if user is asking about any of the available courses/subjects
      let courseDetailsText = '';
      const lowerInput = userInput.toLowerCase();
      
      for (const course of this.courses) {
        const titleWords = course.title.toLowerCase().split(' ');
        const matchesTitle = titleWords.some(word => word.length > 3 && lowerInput.includes(word)) || lowerInput.includes(course.code.toLowerCase()) || (course.code.toLowerCase() === 'edp' && lowerInput.includes('psychology'));
        
        if (matchesTitle) {
          console.log(`🔍 User asked about course: ${course.title}. Fetching details...`);
          try {
            const details = await courseService.getCourseDetails(course.id);
            if (details && details.modules) {
              const modulesText = details.modules.map(mod => {
                const topicsText = mod.topics.map(top => `  - Topic: ${top.title}\n    Description: ${top.description || 'No description'}\n    Content: ${top.content || 'No content'}`).join('\n');
                return `- Module: ${mod.title}\n  Description: ${mod.description || 'No description'}\n${topicsText}`;
              }).join('\n\n');
              
              courseDetailsText = `
DETAILED CURRICULUM AND CONTENT FOR THE SUBJECT "${course.title}" (${course.code}):
${modulesText}
`;
              break;
            }
          } catch (fetchErr) {
            console.error(`Error fetching details for course ${course.id}:`, fetchErr);
          }
        }
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      const enhancedUserInput = this.enhanceUserInput(userInput);

      // Construct Gemini request body
      // Gemini expects systemInstruction in the config, and contents in the request body
      const contents = this.conversationHistory.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Append enhanced input for the current message
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text = `${enhancedUserInput}

IMPORTANT: Provide a response that:
1. Speaks in clean, clear standard English (NO Pidgin English).
2. Uses the student's name if known, or asks for it politely if not.
3. Explains concepts dynamically using real-world scenarios and analogies without navigating.
4. Checks understanding by asking interactive questions.
5. Keeps a calm, reassuring, and highly supportive tone for accessibility.

Current urgent needs analysis:
${this.analyzeUserNeeds(userInput)}`;
      }

      const requestBody = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: this.generateSystemPrompt(courseDetailsText) }]
        },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1200
        }
      };

      console.log('🤖 Sending request to Gemini API...');
      const response = await fetch(`${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!aiResponse.trim()) {
        console.error('❌ Empty response from Gemini API');
        throw new Error('Empty response from Gemini API');
      }

      console.log('✅ Gemini AI response received:', aiResponse.substring(0, 150) + '...');

      // Add to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      return this.parseAgenticResponse(aiResponse, userInput);

    } catch (error) {
      console.error('❌ Gemini AI Service Error:', error);
      return this.generateEnhancedFallbackResponse(userInput);
    }
  }

  // Helper methods replicated from GrokAI
  private enhanceUserInput(userInput: string): string {
    const context = this.userContext;
    let enhancement = userInput;

    if (context) {
      if (context.completedTopics.length === 0) {
        enhancement += " [Context: User has not completed any topics yet - needs guidance on getting started]";
      }
      if (!context.currentCourse) {
        enhancement += " [Context: User is not enrolled in any course - may need enrollment assistance]";
      }
      if (context.performance?.averageScore && context.performance.averageScore < 70) {
        enhancement += " [Context: User's performance could be improved - may need additional support]";
      }
    }
    return enhancement;
  }

  private analyzeUserNeeds(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    const context = this.userContext;
    const needs: string[] = [];

    if (!context?.currentCourse) {
      needs.push("🚨 URGENT: User needs course enrollment to start learning");
    }
    if (context?.completedTopics.length === 0) {
      needs.push("📚 User needs guidance on first steps in learning journey");
    }
    if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes('confused')) {
      needs.push("🆘 User needs immediate assistance and clear direction");
    }
    if (lowerInput.includes('course') || lowerInput.includes('learn') || lowerInput.includes('study')) {
      needs.push("📖 User wants to engage with learning content");
    }
    if (lowerInput.includes('progress') || lowerInput.includes('performance') || lowerInput.includes('how am i')) {
      needs.push("📊 User wants performance feedback and improvement suggestions");
    }
    if (lowerInput.includes('quiz') || lowerInput.includes('test') || lowerInput.includes('assessment')) {
      needs.push("🧪 User wants to test their knowledge");
    }
    if (lowerInput.includes('frustrated') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
      needs.push("💪 User needs encouragement and simplified approach");
    }

    return needs.length > 0 ? needs.join('\n') : "✅ User seems ready for standard learning assistance";
  }

  private parseAgenticResponse(aiResponse: string, userInput: string): AgenticResponse {
    const suggestions = this.extractSuggestions(aiResponse);
    const actions = this.generateActions(aiResponse, userInput);
    const nextSteps = this.extractNextSteps(aiResponse);

    return {
      response: aiResponse,
      suggestions: suggestions,
      actions: actions,
      nextSteps: nextSteps,
      confidence: 0.95
    };
  }

  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    const numberedMatches = response.match(/\d+\.\s*([^.\n]+)/g);
    if (numberedMatches) {
      suggestions.push(...numberedMatches.map(match => match.replace(/\d+\.\s*/, '').trim()));
    }

    const bulletMatches = response.match(/[•\-\*]\s*([^.\n]+)/g);
    if (bulletMatches) {
      suggestions.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s*/, '').trim()));
    }

    if (suggestions.length === 0) {
      if (response.toLowerCase().includes('course')) {
        suggestions.push('Start a new course');
      }
      if (response.toLowerCase().includes('quiz')) {
        suggestions.push('Take a practice quiz');
      }
      if (response.toLowerCase().includes('review')) {
        suggestions.push('Review previous topics');
      }
    }
    return suggestions.slice(0, 3);
  }

  private generateActions(response: string, userInput: string): AgenticAction[] {
    const actions: AgenticAction[] = [];
    const lowerResponse = response.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Check course-related start or enrollment requests
    if (lowerResponse.includes('start') && (lowerResponse.includes('course') || lowerResponse.includes('lesson'))) {
      let matchedCourseId = '1';
      if (this.courses.length > 0) {
        const matched = this.courses.find(c =>
          lowerResponse.includes(c.title.toLowerCase()) ||
          lowerResponse.includes(c.code.toLowerCase()) ||
          lowerInput.includes(c.title.toLowerCase()) ||
          lowerInput.includes(c.code.toLowerCase())
        );
        if (matched) matchedCourseId = matched.id;
      }
      actions.push({
        type: 'start_course',
        description: 'Start recommended course',
        data: { courseId: matchedCourseId }
      });
    }

    if (lowerResponse.includes('enroll') || lowerInput.includes('enroll')) {
      let matchedCourseId = '1';
      if (this.courses.length > 0) {
        const matched = this.courses.find(c =>
          lowerResponse.includes(c.title.toLowerCase()) ||
          lowerResponse.includes(c.code.toLowerCase()) ||
          lowerInput.includes(c.title.toLowerCase()) ||
          lowerInput.includes(c.code.toLowerCase())
        );
        if (matched) matchedCourseId = matched.id;
      }
      actions.push({
        type: 'enroll',
        description: 'Enroll in course',
        data: { courseId: matchedCourseId }
      });
    }

    if (lowerResponse.includes('quiz') || lowerResponse.includes('test')) {
      actions.push({
        type: 'take_quiz',
        description: 'Take a practice quiz',
        data: { topic: this.extractTopicFromInput(userInput) }
      });
    }

    if (lowerResponse.includes('review') || lowerResponse.includes('revisit')) {
      actions.push({
        type: 'review_topic',
        description: 'Review challenging topics',
        data: { topics: this.userContext?.performance?.strugglingTopics || [] }
      });
    }

    if (lowerResponse.includes('go to') || lowerResponse.includes('navigate')) {
      actions.push({
        type: 'navigate',
        description: 'Navigate to learning area',
        data: { destination: 'courses' }
      });
    }

    return actions;
  }

  private extractNextSteps(response: string): string[] {
    const nextSteps: string[] = [];
    const nextMatches = response.match(/(?:next|should|try|consider)\s+([^.!?]+)/gi);
    if (nextMatches) {
      nextSteps.push(...nextMatches.map(match => match.trim()).slice(0, 2));
    }
    if (nextSteps.length === 0) {
      nextSteps.push('Continue with your current learning path');
      nextSteps.push('Ask me any questions about your studies');
    }
    return nextSteps;
  }

  private extractTopicFromInput(input: string): string {
    const topics = [
      'multi-agent systems', 'machine learning', 'educational psychology',
      'curriculum development', 'software engineering', 'molecular biology'
    ];
    const lowerInput = input.toLowerCase();
    const foundTopic = topics.find(topic => lowerInput.includes(topic));
    return foundTopic || 'general';
  }

  private generateEnhancedFallbackResponse(userInput: string): AgenticResponse {
    const lowerInput = userInput.toLowerCase();
    const context = this.userContext;

    let response = "I hear you're feeling stuck, and that's completely normal! Let me help you get back on track right now. ";
    const suggestions: string[] = [];
    const actions: AgenticAction[] = [];
    const nextSteps: string[] = [];

    if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes('confused') || lowerInput.includes('lost')) {
      if (!context?.currentCourse) {
        response += `I can see you haven't enrolled in any courses yet - that's exactly why things feel unclear! I'm going to help you by enrolling you in our Multi-Agent Systems course. It's perfect for building strong foundations.`;
        suggestions.push('Enroll in Multi-Agent Systems course');
        suggestions.push('Start the first topic immediately');
        actions.push({
          type: 'enroll',
          description: 'Enroll in course',
          data: { courseId: '1' }
        });
      } else {
        response += `You're enrolled in ${context.currentCourse} but seem overwhelmed. Let me activate autonomous mode to guide you step-by-step through your learning journey.`;
        suggestions.push('Continue with current course');
        suggestions.push('Review challenging topics');
      }
      nextSteps.push('I\'ll guide you through each step personally');
    } else {
      response = `I understand you want to ${userInput}. Let's work together as a team! Tell me more about what you'd like to explore next.`;
      suggestions.push('Browse available courses');
      suggestions.push('Check learning progress');
      nextSteps.push('Ask me anything about your courses');
    }

    return {
      response,
      suggestions: suggestions.slice(0, 3),
      actions,
      nextSteps: nextSteps.slice(0, 2),
      confidence: 0.8
    };
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  isConfigured(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 10;
  }
}

export const geminiAIService = new GeminiAIService();
