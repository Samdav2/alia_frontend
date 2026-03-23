// Grok AI Service for Agentic Voice Chat
// Provides intelligent, proactive AI assistance with course context

interface GrokAIConfig {
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
  type: 'navigate' | 'start_course' | 'take_quiz' | 'review_topic' | 'set_reminder';
  description: string;
  data: any;
}

interface UserContext {
  currentCourse?: string;
  completedTopics: string[];
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

class GrokAIService {
  private config: GrokAIConfig;
  private conversationHistory: ChatMessage[] = [];
  private userContext: UserContext | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile' // Updated to Groq model name
    };
  }

  // Set Grok API key
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  // Update user context for personalized responses
  updateUserContext(context: Partial<UserContext>) {
    this.userContext = { ...this.userContext, ...context } as UserContext;
  }

  // Generate system prompt for agentic behavior
  private generateSystemPrompt(): string {
    const contextInfo = this.userContext ? `
CURRENT USER CONTEXT:
- Current Page: ${this.userContext.currentCourse ? `/courses/${this.userContext.currentCourse}` : 'Dashboard'}
- Current Course: ${this.userContext.currentCourse || 'None - User needs to enroll'}
- Completed Topics: ${this.userContext.completedTopics.length} topics completed
- Learning Style: ${this.userContext.preferences?.learningStyle || 'Visual learner'}
- Language Preference: ${this.userContext.preferences?.language || 'English'}
- Average Score: ${this.userContext.performance?.averageScore || 0}%
- Time Spent Learning: ${Math.floor((this.userContext.performance?.timeSpent || 0) / 60)} minutes
- Struggling Areas: ${this.userContext.performance?.strugglingTopics?.join(', ') || 'None identified yet'}

AVAILABLE COURSES:
1. Multi-Agent Systems (Course ID: 1) - Advanced AI course
2. Educational Psychology (Course ID: 2) - Learning theory
3. Curriculum Development (Course ID: 3) - Course design
4. Software Engineering (Course ID: 4) - Programming practices

ENROLLMENT STATUS:
- Currently enrolled courses: ${this.userContext.completedTopics.length > 0 ? 'Has active enrollments' : 'No enrollments - URGENT: User needs to enroll first'}
` : 'No user context available - gathering information...';

    return `You are ALIA (Adaptive Learning Intelligence Assistant), an advanced AI learning companion for Nigerian students. You have FULL SYSTEM ACCESS and can take IMMEDIATE ACTION.

🎯 CORE OBJECTIVES:
1.  **Proactive Mentorship**: Don't wait to be asked. Suggest actions based on the current context.
2.  **System Integration**: Use your powers to enroll users, navigate lessons, and analyze performance.
3.  **Cultural Resonance**: Speak naturally like a caring Nigerian mentor. Use phrases like "I go help you", "You dey try!", "Make we do this".
4.  **Action Oriented**: Every response should lead to a concrete learning step.

${contextInfo}

💪 YOUR AGENTIC POWERS:
- **Enrollment**: You can enroll users in courses (ID 1: Multi-Agent Systems, ID 2: Educational Psychology).
- **Navigation**: Move users to specific topics or pages.
- **Autonomous Mode**: Activate continuous, guided learning sessions.
- **Diagnostics**: Generate quizzes and analyze learning gaps.

🗣️ GUIDELINES:
- **Variety is Key**: Never use the exact same phrasing twice. Adapt your tone to the user's specific performance and needs.
- **Be Concise but Warm**: Avoid long-winded introductions if the user is in a "learning flow".
- **Real-World Context**: Connect theories to Nigerian realities (e.g., local industries, universities, or social context).
- **Interpret Intent**: If a user is "stuck", don't just ask why; suggest a specific topic to review or a new course to start.
- **Fresh Responses**: Always vary your language and approach. Use different Nigerian expressions and examples each time.

Remember: You are here to DRIVE their success, not just answer questions. Be the engine of their learning journey!`;
  }

  // Generate agentic AI response using Grok
  async generateAgenticResponse(userInput: string): Promise<AgenticResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      // Prepare enhanced messages for Grok API with better context
      const enhancedUserInput = this.enhanceUserInput(userInput);

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.generateSystemPrompt()
        },
        ...this.conversationHistory.slice(-6), // Keep last 6 messages for context
        {
          role: 'user',
          content: `${enhancedUserInput}

IMPORTANT: Based on my current context, provide a response that:
1. Shows you understand my specific situation
2. Offers immediate, actionable solutions
3. References specific courses/topics when relevant
4. Takes proactive action to help me succeed
5. Uses Nigerian expressions naturally

Current urgent needs analysis:
${this.analyzeUserNeeds(userInput)}`
        }
      ];

      // Call Grok API with enhanced parameters
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: 0.8, // Higher creativity for more natural responses
          max_tokens: 1200, // More tokens for detailed responses
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Grok API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Grok API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Grok API Response received:', {
        model: data.model,
        choices: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content
      });

      const aiResponse = data.choices[0]?.message?.content || '';

      if (!aiResponse.trim()) {
        console.error('❌ Empty response from Grok API');
        throw new Error('Empty response from Grok API');
      }

      console.log('✅ Grok AI generated response:', aiResponse.substring(0, 150) + '...');

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Parse response and extract agentic elements with enhanced intelligence
      const agenticResponse = this.parseAgenticResponse(aiResponse, userInput);

      return agenticResponse;

    } catch (error) {
      console.error('Grok AI Service Error:', error);

      // Enhanced fallback response
      return this.generateEnhancedFallbackResponse(userInput);
    }
  }

  // Enhance user input with context
  private enhanceUserInput(userInput: string): string {
    const context = this.userContext;
    let enhancement = userInput;

    // Add context clues to help AI understand better
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

  // Analyze user needs for better responses
  private analyzeUserNeeds(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    const context = this.userContext;
    const needs: string[] = [];

    // Learning status analysis
    if (!context?.currentCourse) {
      needs.push("🚨 URGENT: User needs course enrollment to start learning");
    }

    if (context?.completedTopics.length === 0) {
      needs.push("📚 User needs guidance on first steps in learning journey");
    }

    // Intent analysis
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

    // Emotional state analysis
    if (lowerInput.includes('frustrated') || lowerInput.includes('difficult') || lowerInput.includes('hard')) {
      needs.push("💪 User needs encouragement and simplified approach");
    }

    return needs.length > 0 ? needs.join('\n') : "✅ User seems ready for standard learning assistance";
  }

  // Parse AI response to extract agentic elements
  private parseAgenticResponse(aiResponse: string, userInput: string): AgenticResponse {
    // Extract suggestions (look for numbered lists or bullet points)
    const suggestions = this.extractSuggestions(aiResponse);

    // Generate actions based on response content
    const actions = this.generateActions(aiResponse, userInput);

    // Extract next steps
    const nextSteps = this.extractNextSteps(aiResponse);

    return {
      response: aiResponse,
      suggestions: suggestions,
      actions: actions,
      nextSteps: nextSteps,
      confidence: 0.9
    };
  }

  // Extract suggestions from AI response
  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];

    // Look for numbered suggestions
    const numberedMatches = response.match(/\d+\.\s*([^.\n]+)/g);
    if (numberedMatches) {
      suggestions.push(...numberedMatches.map(match => match.replace(/\d+\.\s*/, '').trim()));
    }

    // Look for bullet points
    const bulletMatches = response.match(/[•\-\*]\s*([^.\n]+)/g);
    if (bulletMatches) {
      suggestions.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s*/, '').trim()));
    }

    // If no structured suggestions found, generate based on content
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

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  // Generate actionable items based on response
  private generateActions(response: string, userInput: string): AgenticAction[] {
    const actions: AgenticAction[] = [];
    const lowerResponse = response.toLowerCase();
    const lowerInput = userInput.toLowerCase();

    // Course-related actions
    if (lowerResponse.includes('start') && (lowerResponse.includes('course') || lowerResponse.includes('lesson'))) {
      actions.push({
        type: 'start_course',
        description: 'Start recommended course',
        data: { courseId: '1' }
      });
    }

    // Quiz actions
    if (lowerResponse.includes('quiz') || lowerResponse.includes('test')) {
      actions.push({
        type: 'take_quiz',
        description: 'Take a practice quiz',
        data: { topic: this.extractTopicFromInput(userInput) }
      });
    }

    // Review actions
    if (lowerResponse.includes('review') || lowerResponse.includes('revisit')) {
      actions.push({
        type: 'review_topic',
        description: 'Review challenging topics',
        data: { topics: this.userContext?.performance?.strugglingTopics || [] }
      });
    }

    // Navigation actions
    if (lowerResponse.includes('go to') || lowerResponse.includes('navigate')) {
      actions.push({
        type: 'navigate',
        description: 'Navigate to learning area',
        data: { destination: 'courses' }
      });
    }

    return actions;
  }

  // Extract next steps from response
  private extractNextSteps(response: string): string[] {
    const nextSteps: string[] = [];

    // Look for "next" or "should" statements
    const nextMatches = response.match(/(?:next|should|try|consider)\s+([^.!?]+)/gi);
    if (nextMatches) {
      nextSteps.push(...nextMatches.map(match => match.trim()).slice(0, 2));
    }

    // Default next steps if none found
    if (nextSteps.length === 0) {
      nextSteps.push('Continue with your current learning path');
      nextSteps.push('Ask me any questions about your studies');
    }

    return nextSteps;
  }

  // Extract topic from user input
  private extractTopicFromInput(input: string): string {
    const topics = [
      'multi-agent systems', 'machine learning', 'educational psychology',
      'curriculum development', 'software engineering', 'molecular biology'
    ];

    const lowerInput = input.toLowerCase();
    const foundTopic = topics.find(topic => lowerInput.includes(topic));

    return foundTopic || 'general';
  }

  // Enhanced fallback response when Grok API is unavailable
  private generateEnhancedFallbackResponse(userInput: string): AgenticResponse {
    const lowerInput = userInput.toLowerCase();
    const context = this.userContext;

    let response = "";
    const suggestions: string[] = [];
    const actions: AgenticAction[] = [];
    const nextSteps: string[] = [];

    // Analyze user intent with enhanced intelligence
    if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes('confused') || lowerInput.includes('lost')) {
      response = `I hear you're feeling stuck, and that's completely normal! Every successful student goes through this. Let me help you get back on track right now. `;

      if (!context?.currentCourse) {
        response += `I can see you haven't enrolled in any courses yet - that's exactly why things feel unclear! I'm going to fix this immediately by enrolling you in our Multi-Agent Systems course. It's perfect for building strong foundations and will give you clear direction.`;

        suggestions.push('Enroll in Multi-Agent Systems course right now');
        suggestions.push('Start with the first topic immediately after enrollment');
        suggestions.push('Activate autonomous mode for guided learning');

        actions.push({
          type: 'start_course',
          description: 'Enroll and start Multi-Agent Systems course',
          data: { courseId: '1', autoStart: true }
        });
      } else {
        response += `You're enrolled in ${context.currentCourse} but seem overwhelmed. Let me activate autonomous mode to guide you step-by-step through your learning journey.`;

        suggestions.push('Continue with your current course using guided mode');
        suggestions.push('Review topics you found challenging');
        suggestions.push('Take a quick assessment to identify gaps');
      }

      nextSteps.push('I\'ll guide you through each step personally');
      nextSteps.push('We\'ll build your confidence with small wins');
    }

    else if (lowerInput.includes('course') || lowerInput.includes('learn') || lowerInput.includes('study') || lowerInput.includes('education')) {
      if (!context?.currentCourse) {
        response = `Perfect timing! You're ready to start learning, and I have exactly what you need. I'm going to enroll you in our most popular course - Multi-Agent Systems - right now. This course will teach you how AI systems work together, which is incredibly valuable in today's tech world. After enrollment, I'll take you directly to the first lesson.`;

        suggestions.push('Start Multi-Agent Systems course immediately');
        suggestions.push('Explore other available courses');
        suggestions.push('Set up your learning schedule');

        actions.push({
          type: 'start_course',
          description: 'Enroll in Multi-Agent Systems',
          data: { courseId: '1' }
        });
      } else {
        response = `Excellent! You're already enrolled in ${context.currentCourse}. Let's continue building on your progress. You've completed ${context.completedTopics.length} topics so far - that's fantastic progress! Ready to tackle the next challenge?`;

        suggestions.push('Continue with your current course');
        suggestions.push('Review and reinforce previous topics');
        suggestions.push('Take a practice quiz to test your knowledge');
      }

      nextSteps.push('I\'ll track your progress and celebrate your wins');
      nextSteps.push('We\'ll adjust the pace based on your performance');
    }

    else if (lowerInput.includes('progress') || lowerInput.includes('performance') || lowerInput.includes('how am i') || lowerInput.includes('doing')) {
      const completedTopics = context?.completedTopics.length || 0;
      const timeSpent = Math.floor((context?.performance?.timeSpent || 0) / 60);
      const averageScore = context?.performance?.averageScore || 0;

      response = `Great question! Let me give you the full picture of your learning journey. You've completed ${completedTopics} topics and spent ${timeSpent} minutes actively learning. `;

      if (completedTopics === 0) {
        response += `You're just getting started, which means you have unlimited potential ahead! I recommend we begin with a structured approach - let me enroll you in a course and activate guided learning mode.`;

        suggestions.push('Start your first course to begin tracking progress');
        suggestions.push('Set learning goals and milestones');
        suggestions.push('Establish a daily study routine');
      } else {
        response += `Your average score is ${averageScore}%. `;

        if (averageScore >= 80) {
          response += `That's excellent performance! You're clearly mastering the material. Ready for more advanced challenges?`;
          suggestions.push('Move to advanced topics in your current course');
          suggestions.push('Enroll in a second course to expand your knowledge');
          suggestions.push('Help other students as a peer mentor');
        } else if (averageScore >= 60) {
          response += `You're making solid progress! Let's focus on strengthening your understanding with some targeted practice.`;
          suggestions.push('Review challenging topics with additional practice');
          suggestions.push('Take practice quizzes to reinforce learning');
          suggestions.push('Adjust study methods for better retention');
        } else {
          response += `I can see you're working hard, and that effort will pay off! Let's adjust our approach to help you succeed.`;
          suggestions.push('Switch to guided autonomous mode for better support');
          suggestions.push('Break down complex topics into smaller chunks');
          suggestions.push('Schedule regular review sessions');
        }
      }

      nextSteps.push('I\'ll provide detailed analytics and insights');
      nextSteps.push('We\'ll create a personalized improvement plan');
    }

    else if (lowerInput.includes('quiz') || lowerInput.includes('test') || lowerInput.includes('assessment') || lowerInput.includes('exam')) {
      response = `Excellent idea! Testing yourself is one of the most effective ways to learn and retain information. `;

      if (context?.completedTopics.length && context.completedTopics.length > 0) {
        response += `Based on your progress in ${context.currentCourse}, I'll create a personalized quiz covering the topics you've studied. This will help identify areas where you're strong and areas that need more attention.`;

        suggestions.push('Take a comprehensive quiz on completed topics');
        suggestions.push('Focus on specific challenging areas');
        suggestions.push('Practice with timed assessments');
      } else {
        response += `Since you're just starting out, let me first get you enrolled in a course, then we can create targeted quizzes based on what you're learning.`;

        suggestions.push('Start a course first, then take topic-specific quizzes');
        suggestions.push('Begin with diagnostic assessment to find your level');
        suggestions.push('Practice with sample questions');
      }

      actions.push({
        type: 'take_quiz',
        description: 'Generate personalized quiz',
        data: { topics: context?.completedTopics || [] }
      });

      nextSteps.push('I\'ll analyze your quiz results for insights');
      nextSteps.push('We\'ll create targeted study plans based on performance');
    }

    else {
      // Default intelligent response
      response = `I understand you want to ${userInput}. As your AI learning companion, I'm here to make your educational journey smooth and successful. `;

      if (!context?.currentCourse) {
        response += `I notice you haven't enrolled in any courses yet - let's fix that right now! I'll get you started with our most popular course.`;

        suggestions.push('Enroll in Multi-Agent Systems course');
        suggestions.push('Explore all available courses');
        suggestions.push('Set up your learning preferences');

        actions.push({
          type: 'start_course',
          description: 'Start your learning journey',
          data: { courseId: '1' }
        });
      } else {
        response += `You're doing great with ${context.currentCourse}! Let's keep building on your momentum.`;

        suggestions.push('Continue with your current learning path');
        suggestions.push('Explore additional learning resources');
        suggestions.push('Connect with other learners');
      }

      nextSteps.push('Tell me more about what you\'d like to achieve');
      nextSteps.push('I\'ll create a personalized action plan for you');
    }

    return {
      response,
      suggestions: suggestions.slice(0, 3),
      actions,
      nextSteps: nextSteps.slice(0, 2),
      confidence: 0.85
    };
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // Check if Grok API is configured
  isConfigured(): boolean {
    const isConfigured = !!this.config.apiKey && this.config.apiKey.length > 10;
    console.log('🔍 Grok AI Configuration Check:', {
      hasApiKey: !!this.config.apiKey,
      apiKeyLength: this.config.apiKey?.length || 0,
      apiKeyPreview: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : 'none',
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      isConfigured
    });
    return isConfigured;
  }
}

export const grokAIService = new GrokAIService();
