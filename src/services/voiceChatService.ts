// Interactive Voice Chat Service
// Handles voice-to-voice conversations with AI using Grok AI for agentic responses

import { textToSpeechService } from './textToSpeechService';
import { grokAIService } from './grokAIService';
import { systemControlService } from './systemControlService';
import { enrollmentService } from './enrollmentService';
import { courseService } from './api/courseService';

export interface VoiceChatSession {
  id: string;
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  conversationHistory: VoiceChatMessage[];
  currentTopic?: string;
  isAgenticMode: boolean;
  waitingForUser: boolean;
  preparingResponse?: string; // Preview of what AI will say
  isContinuousMode: boolean; // Like autonomous mode - stays active
  currentAction?: string; // What action is being executed
}

export interface VoiceChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  transcription?: string;
  suggestions?: string[];
  actions?: any[];
}

class VoiceChatService {
  private session: VoiceChatSession | null = null;
  private recognition: any = null; // Use any to avoid type conflicts
  private isInitialized = false;
  private interimTranscript = '';
  private finalTranscript = '';
  private speechTimeout: NodeJS.Timeout | null = null;
  private silenceTimeout: NodeJS.Timeout | null = null;
  private isProcessingResponse = false;
  private isRecognitionActive = false; // Flag to track SpeechRecognition state
  private lastAIResponse = ''; // Track what AI just said
  private aiResponseBlacklist: Set<string> = new Set(); // Blacklist of AI phrases

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Changed to false to prevent picking up own speech
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          console.log('🎤 Voice recognition started');
          this.isRecognitionActive = true;
          this.updateSessionState({ isListening: true, waitingForUser: true });
          this.interimTranscript = '';
          this.finalTranscript = '';
          this.clearTimeouts();
        };

        this.recognition.onend = () => {
          console.log('🎤 Voice recognition ended');
          this.isRecognitionActive = false;
          this.updateSessionState({ isListening: false });

          // Process final transcript if we have one and not already processing
          if (this.finalTranscript.trim() && !this.isProcessingResponse && !this.session?.isSpeaking) {
            this.handleUserSpeech(this.finalTranscript.trim());
            this.finalTranscript = '';
          } else if (this.session?.isActive && !this.session.isSpeaking && !this.isProcessingResponse) {
            // Auto-restart if session is still active and not speaking
            setTimeout(() => {
              if (this.session?.isActive && !this.session.isSpeaking && !this.isProcessingResponse) {
                this.startListening();
              }
            }, 500);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('🚨 Speech recognition error:', event.error);
          this.updateSessionState({ isListening: false });

          // Handle specific errors
          if (event.error === 'no-speech') {
            console.log('⏰ No speech detected, will restart after AI response');
          } else if (event.error === 'aborted') {
            console.log('🛑 Speech recognition aborted');
          } else {
            // For other errors, try to restart after a delay
            setTimeout(() => {
              if (this.session?.isActive && !this.session.isSpeaking && !this.isProcessingResponse) {
                this.startListening();
              }
            }, 2000);
          }
        };

        this.recognition.onresult = (event: any) => {
          // CRITICAL: Ignore speech recognition results while AI is speaking
          if (this.session?.isSpeaking) {
            console.log('🔇 Ignoring speech input while AI is speaking (preventing loop)');
            return;
          }

          this.interimTranscript = '';
          let newFinalTranscript = '';

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.trim();

            if (result.isFinal) {
              newFinalTranscript += transcript + ' ';
            } else {
              this.interimTranscript += transcript;
            }
          }

          // Update final transcript
          if (newFinalTranscript) {
            this.finalTranscript = newFinalTranscript.trim();
            console.log('📝 Final transcript:', this.finalTranscript);

            // Clear any existing timeout and set a new one
            this.clearTimeouts();
            this.speechTimeout = setTimeout(() => {
              if (this.finalTranscript.trim() && !this.isProcessingResponse && !this.session?.isSpeaking) {
                console.log('⏱️ Speech timeout - processing transcript');
                this.stopListening();
                this.handleUserSpeech(this.finalTranscript.trim());
                this.finalTranscript = '';
              }
            }, 1500); // Reduced to 1.5 seconds
          }

          // Log interim results for debugging
          if (this.interimTranscript) {
            console.log('🔄 Interim:', this.interimTranscript);
          }
        };

        this.isInitialized = true;
      } else {
        console.warn('⚠️ Speech recognition not supported in this browser');
      }
    }
  }

  private clearTimeouts() {
    if (this.speechTimeout) {
      clearTimeout(this.speechTimeout);
      this.speechTimeout = null;
    }
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  // Start a new voice chat session
  startVoiceChat(agenticMode: boolean = true): VoiceChatSession {
    this.session = {
      id: Date.now().toString(),
      isActive: true,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      conversationHistory: [],
      currentTopic: undefined,
      isAgenticMode: agenticMode,
      waitingForUser: false,
      preparingResponse: undefined,
      isContinuousMode: agenticMode, // Continuous mode for agentic
      currentAction: undefined
    };

    // Update system context
    systemControlService.updateContext();

    // Start with AI greeting and immediate action
    const greeting = agenticMode
      ? "Hello! I'm ALIA, your intelligent learning assistant with full system access. I can see your current progress and I'm ready to take action to help you succeed. I'm now in continuous mode - I'll keep helping you until you tell me to stop. Let me start by analyzing your current situation and taking immediate action to improve your learning journey!"
      : "Hello! I'm ALIA, your voice assistant. How can I help you today? You can ask me about your courses, request explanations, or get study help. Just speak naturally!";

    // In continuous mode, start immediate analysis and action
    if (agenticMode) {
      this.startContinuousMode();
    } else {
      this.speakAIResponse(greeting);
    }

    return this.session;
  }

  // Start continuous mode like autonomous agent
  private async startContinuousMode() {
    if (!this.session || !this.session.isContinuousMode) return;

    // Initial greeting and analysis
    const greeting = "Hello! I'm ALIA in continuous mode. I'm analyzing your learning situation right now and will take immediate action to help you succeed. Let me check your progress and start helping you immediately!";

    this.speakAIResponse(greeting);

    // Wait for greeting to finish, then start continuous analysis
    setTimeout(async () => {
      await this.performContinuousAnalysis();
    }, 5000);
  }

  // Perform continuous analysis and actions like autonomous mode
  private async performContinuousAnalysis() {
    if (!this.session?.isContinuousMode || !this.session.isActive) return;

    const context = systemControlService.getUserContext();

    // Analyze current situation and take action
    let analysisResult = "";
    let actionTaken = false;

    // Check enrollment status
    if (context.enrolledCourses.length === 0) {
      analysisResult = "I can see you're not enrolled in any courses yet. This is the perfect place to start! I'm enrolling you in our Multi-Agent Systems course right now - it's designed specifically for building strong foundations in AI and technology.";

      // Execute enrollment
      try {
        // Get available courses first to find a suitable course UUID
        const availableCourses = await courseService.getAllCourses({ limit: 1 });
        if (availableCourses.courses.length > 0) {
          const courseId = availableCourses.courses[0].id; // Use actual UUID
          const enrolled = enrollmentService.enrollInCourse(courseId);
          if (enrolled) {
            analysisResult += ` ✅ Enrollment successful! You're now enrolled in ${availableCourses.courses[0].title}. I'll continue helping you with your learning journey.`;
            actionTaken = true;

            // Instead of immediate navigation, announce the action and continue conversation
            analysisResult += " You can visit your courses anytime, and I'll keep helping you right here in continuous mode!";
          }
        } else {
          analysisResult += " I'm ready to help you get started with learning. Let me know what subjects interest you!";
        }
      } catch (error) {
        console.error('Error during enrollment:', error);
        analysisResult += " I'm here to help you start your learning journey. What subjects are you interested in?";
      }
    }
    else if (context.completedTopics.length === 0) {
      analysisResult = `Great! You're enrolled in ${context.enrolledCourses.length} course(s), but I notice you haven't completed any topics yet. I'm here to guide you through your learning journey. You can start your first lesson anytime, and I'll be right here to help you understand the concepts and answer any questions!`;
      actionTaken = true;
    }
    else {
      const progress = Math.round((context.completedTopics.length / 18) * 100);
      analysisResult = `Excellent! You've completed ${context.completedTopics.length} topics - that's ${progress}% progress! Your average score is ${context.performance.averageScore}%. `;

      if (context.performance.averageScore < 70) {
        analysisResult += "I notice your scores could be improved. I'm here to help you understand difficult concepts better and provide personalized explanations to boost your performance.";
        actionTaken = true;
      } else if (context.performance.averageScore >= 80) {
        analysisResult += "Your performance is excellent! I'm ready to help you tackle more challenging topics and continue building your expertise.";
        actionTaken = true;
      } else {
        analysisResult += "You're making solid progress! I'll continue guiding you through your learning journey and help with any questions you have.";
      }
    }

    // Add analysis to conversation
    const analysisMessage: VoiceChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: analysisResult,
      timestamp: new Date(),
      suggestions: [
        'Continue with guided learning',
        'Ask me any questions',
        'Request specific help',
        'Explain difficult concepts'
      ],
      actions: actionTaken ? [{
        type: 'guide',
        description: 'Providing continuous learning guidance'
      }] : []
    };

    this.session.conversationHistory.push(analysisMessage);
    this.session.currentAction = actionTaken ? 'Providing continuous guidance' : 'Ready for your input';

    // Speak the analysis
    this.speakAIResponse(analysisResult);

    // After speaking, start listening for user input
    setTimeout(() => {
      if (this.session?.isContinuousMode && this.session.isActive) {
        this.startListening();
      }
    }, analysisResult.length * 50 + 2000); // Estimate speaking time + buffer
  }

  // Stop the current voice chat session
  stopVoiceChat() {
    if (this.session) {
      this.session.isActive = false;
      this.session.isContinuousMode = false;
      this.stopListening();
      textToSpeechService.stop();
      this.clearTimeouts();
      this.isProcessingResponse = false;
    }
    this.session = null;
  }

  // Stop continuous mode but keep chat active
  stopContinuousMode() {
    if (this.session) {
      this.session.isContinuousMode = false;
      this.updateSessionState({ currentAction: 'Continuous mode stopped' });
      this.speakAIResponse("Continuous mode stopped. I'm still here to help when you need me - just start speaking!");
    }
  }

  // Resume continuous mode
  resumeContinuousMode() {
    if (this.session && !this.session.isContinuousMode) {
      this.session.isContinuousMode = true;
      this.updateSessionState({ currentAction: 'Continuous mode resumed' });
      this.speakAIResponse("Welcome back! I'm resuming continuous mode. I'm here to continue helping you with your learning journey. What would you like to work on?");

      // Start listening after welcome message
      setTimeout(() => {
        if (this.session?.isContinuousMode && this.session.isActive) {
          this.startListening();
        }
      }, 4000);
    }
  }

  // Handle navigation requests in continuous mode
  async handleNavigationRequest(userInput: string): Promise<boolean> {
    if (!this.session?.isContinuousMode) return false;

    const input = userInput.toLowerCase();
    let navigationResponse = "";
    let shouldNavigate = false;
    let navigationUrl = "";

    // Check for navigation requests
    if (input.includes('take me to') || input.includes('go to') || input.includes('show me')) {
      if (input.includes('course') || input.includes('lesson') || input.includes('topic')) {
        const context = systemControlService.getUserContext();

        if (context.enrolledCourses.length > 0) {
          navigationResponse = "Taking you to your course now!";
          shouldNavigate = true;
          // Use the actual enrolled course UUID and try to get first topic
          const courseId = context.enrolledCourses[0];
          try {
            const firstTopicId = await systemControlService.getFirstTopicId(courseId);
            if (firstTopicId) {
              navigationUrl = `/courses/${courseId}/topics/${firstTopicId}`;
            } else {
              navigationUrl = `/courses/${courseId}`;
            }
          } catch (error) {
            navigationUrl = `/courses/${courseId}`;
          }
        } else {
          navigationResponse = "Let me enroll you in a course first, then I'll take you there!";
          // Don't navigate immediately - let the enrollment complete first
          shouldNavigate = false;
        }
      } else if (input.includes('dashboard') || input.includes('home')) {
        navigationResponse = "Taking you to your dashboard!";
        shouldNavigate = true;
        navigationUrl = '/dashboard/student';
      } else if (input.includes('profile')) {
        navigationResponse = "Taking you to your profile!";
        shouldNavigate = true;
        navigationUrl = '/dashboard/student/profile';
      }
    }

    if (shouldNavigate) {
      // CRITICAL: MUTE MICROPHONE completely before navigation
      console.log('🚫 MUTING MIC - Stopping voice chat before navigation');
      
      // Abort recognition immediately - don't just stop it
      if (this.recognition && this.isRecognitionActive) {
        try {
          this.recognition.abort();
        } catch (e) {
          console.log('Recognition already stopped');
        }
        this.isRecognitionActive = false;
      }
      
      // Clear transcripts
      this.finalTranscript = '';
      this.interimTranscript = '';
      this.clearTimeouts();
      this.isProcessingResponse = true;
      
      // Speak the navigation response WITHOUT restarting listening
      this.updateSessionState({ isSpeaking: true, waitingForUser: false, isListening: false });
      
      textToSpeechService.speak(navigationResponse, {
        onStart: () => {
          console.log('🔊 Navigation announcement started - MIC MUTED');
        },
        onEnd: () => {
          console.log('✅ Navigation announcement ended - navigating now WITHOUT unmuting');
          // Navigate immediately, DON'T unmute mic
          if (typeof window !== 'undefined') {
            this.stopVoiceChat();
            window.location.href = navigationUrl;
          }
        },
        onError: (error) => {
          console.error('TTS error during navigation:', error);
          // Navigate anyway even if speech fails
          if (typeof window !== 'undefined') {
            this.stopVoiceChat();
            window.location.href = navigationUrl;
          }
        }
      });

      return true;
    }

    return false;
  }

  // Start listening for user input
  startListening() {
    if (!this.isInitialized || !this.recognition || !this.session?.isActive) {
      console.warn('⚠️ Voice chat not properly initialized or not active');
      return;
    }

    if (this.session.isSpeaking || this.isProcessingResponse) {
      console.log('⏳ AI is speaking or processing, will start listening after');
      return;
    }

    try {
      if (this.isRecognitionActive) {
        console.log('🎤 Recognition already active, skipping start command');
        return;
      }
      console.log('🎤 Starting to listen...');
      this.recognition.start();
    } catch (error) {
      console.error('🚨 Error starting speech recognition:', error);
      // Try to restart after a delay
      setTimeout(() => {
        if (this.session?.isActive && !this.session.isSpeaking && !this.isProcessingResponse) {
          this.startListening();
        }
      }, 1000);
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    this.clearTimeouts();
  }

  // Handle user speech input
  private async handleUserSpeech(transcript: string) {
    if (!this.session || !transcript.trim() || this.isProcessingResponse) return;

    // CRITICAL: Don't process if AI is currently speaking (prevent loop)
    if (this.session.isSpeaking) {
      console.log('🔇 Ignoring user speech while AI is speaking (preventing loop)');
      return;
    }

    console.log('🗣️ Processing user speech:', transcript);

    // CRITICAL: Check if this transcript matches what the AI just said (prevent echo loop)
    const transcriptLower = transcript.toLowerCase().trim();
    
    // Check if transcript contains any blacklisted AI phrases
    for (const phrase of this.aiResponseBlacklist) {
      if (transcriptLower.includes(phrase.toLowerCase())) {
        console.log('🚫 BLOCKED: Transcript contains AI phrase:', phrase);
        console.log('🚫 This is the AI hearing itself - ignoring');
        return; // Don't process AI's own speech
      }
    }

    // Check if transcript is too similar to last AI response
    if (this.lastAIResponse) {
      const similarity = this.calculateSimilarity(transcriptLower, this.lastAIResponse.toLowerCase());
      if (similarity > 0.6) { // 60% similar
        console.log('🚫 BLOCKED: Transcript too similar to AI response (', Math.round(similarity * 100), '% match)');
        return;
      }
    }

    // Declare lowerTranscript at the very beginning
    const lowerTranscript = transcript.toLowerCase();

    // Check for continuous mode commands FIRST
    if (lowerTranscript.includes('start continuous') ||
        lowerTranscript.includes('resume continuous') ||
        lowerTranscript.includes('activate continuous')) {
      this.resumeContinuousMode();
      return;
    }

    // Check for stop commands in continuous mode
    if (this.session.isContinuousMode && (
      lowerTranscript.includes('stop continuous') ||
      lowerTranscript.includes('stop mode') ||
      lowerTranscript.includes('pause continuous') ||
      lowerTranscript.includes('stop helping')
    )) {
      this.stopContinuousMode();
      return;
    }

    // Check for complete stop commands
    if (lowerTranscript.includes('stop voice chat') ||
      lowerTranscript.includes('end chat') ||
      lowerTranscript.includes('goodbye alia')) {
      this.speakAIResponse("Goodbye! It was great helping you with your learning journey. Come back anytime you need assistance!");
      setTimeout(() => this.stopVoiceChat(), 3000);
      return;
    }

    // Check for navigation requests in continuous mode
    if (this.session.isContinuousMode) {
      const navigationHandled = await this.handleNavigationRequest(transcript);
      if (navigationHandled) {
        return; // Navigation handled, exit early
      }
    }

    this.isProcessingResponse = true;
    this.updateSessionState({
      waitingForUser: false,
      isProcessing: true,
      preparingResponse: 'Analyzing your request and preparing intelligent response...',
      currentAction: `Processing: "${transcript}"`
    });

    // Add user message to conversation
    const userMessage: VoiceChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript,
      timestamp: new Date(),
      transcription: transcript
    };

    this.session.conversationHistory.push(userMessage);

    try {
      // Generate AI response based on mode
      let aiResponse: string;
      let suggestions: string[] = [];
      let actions: any[] = [];

      if (this.session.isAgenticMode) {
        // PRIORITIZE Grok AI for intelligent agentic responses
        if (grokAIService.isConfigured()) {
          try {
            console.log('🤖 Using Grok AI as PRIMARY intelligence for agentic mode...');

            // Convert our UserContext to Grok's expected format
            const grokContext = {
              currentCourse: systemControlService.getUserContext().currentCourse,
              completedTopics: systemControlService.getUserContext().completedTopics,
              learningGoals: [], // Default empty array
              preferences: {
                language: systemControlService.getUserContext().preferences.language,
                learningStyle: 'visual', // Default value
                difficulty: 'intermediate' // Default value
              },
              performance: {
                averageScore: systemControlService.getUserContext().performance.averageScore,
                timeSpent: systemControlService.getUserContext().performance.totalTimeSpent,
                strugglingTopics: [] // Default empty array
              }
            };

            grokAIService.updateUserContext(grokContext);
            const grokResponse = await grokAIService.generateAgenticResponse(transcript);

            // Use Grok's response as PRIMARY
            aiResponse = grokResponse.response;
            suggestions = grokResponse.suggestions;
            actions = grokResponse.actions;

            // RESTORED: Auto-execute actions suggested by Grok if appropriate
            if (actions && actions.length > 0) {
              console.log(`🚀 AI suggested ${actions.length} actions. Executing primary...`);
              // Only auto-execute the most relevant first action to avoid chaos
              const primaryAction = actions[0];
              try {
                const actionResult = await systemControlService.executeRawAction({
                  type: primaryAction.type,
                  description: primaryAction.description,
                  data: primaryAction.data
                });
                aiResponse += `\n\n[Action Executed: ${actionResult}]`;
                console.log('✅ Action executed successfully:', actionResult);
              } catch (actionError) {
                console.error('❌ Failed to execute AI action:', actionError);
              }
            }
          } catch (error) {
            console.error('❌ Grok AI failed, falling back to system control:', error);

            // Fallback to system control service
            const contextualResponse = await systemControlService.getContextualResponse(transcript);
            aiResponse = contextualResponse.response;
            suggestions = systemControlService.getSmartSuggestions();

            // Auto-execute action if determined
            if (contextualResponse.autoExecute) {
              const actionResult = await systemControlService.executeAction(contextualResponse.autoExecute);
              aiResponse += ' ' + actionResult;
            }

            // Add available actions
            actions = contextualResponse.actions.map(action => ({
              type: action.type,
              description: action.description
            }));
          }
        } else {
          // No Grok AI configured, use system control service
          console.log('⚠️ Grok AI not configured, using system control service');
          const contextualResponse = await systemControlService.getContextualResponse(transcript);
          aiResponse = contextualResponse.response;
          suggestions = systemControlService.getSmartSuggestions();

          // Auto-execute action if determined
          if (contextualResponse.autoExecute) {
            const actionResult = await systemControlService.executeAction(contextualResponse.autoExecute);
            aiResponse += ' ' + actionResult;
          }

          // Add available actions
          actions = contextualResponse.actions.map(action => ({
            type: action.type,
            description: action.description
          }));
        }
      } else {
        // Use Grok AI if available, otherwise local response
        if (grokAIService.isConfigured()) {
          try {
            // Convert our UserContext to Grok's expected format
            const grokContext = {
              currentCourse: systemControlService.getUserContext().currentCourse,
              completedTopics: systemControlService.getUserContext().completedTopics,
              learningGoals: [], // Default empty array
              preferences: {
                language: systemControlService.getUserContext().preferences.language,
                learningStyle: 'visual', // Default value
                difficulty: 'intermediate' // Default value
              },
              performance: {
                averageScore: systemControlService.getUserContext().performance.averageScore,
                timeSpent: systemControlService.getUserContext().performance.totalTimeSpent,
                strugglingTopics: [] // Default empty array
              }
            };

            grokAIService.updateUserContext(grokContext);
            const agenticResponse = await grokAIService.generateAgenticResponse(transcript);
            aiResponse = agenticResponse.response;
            suggestions = agenticResponse.suggestions;
            actions = agenticResponse.actions;
          } catch (error) {
            console.error('Grok AI error, falling back:', error);
            aiResponse = await this.generateLocalResponse(transcript);
          }
        } else {
          aiResponse = await this.generateLocalResponse(transcript);
        }
      }

      // Add AI response to conversation
      const aiMessage: VoiceChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: suggestions,
        actions: actions
      };

      this.session.conversationHistory.push(aiMessage);

      // Show preview of what AI will say (like autonomous mode)
      console.log('🤖 AI Response Preview:', aiResponse.substring(0, 100) + '...');
      this.updateSessionState({
        preparingResponse: `About to say: "${aiResponse.substring(0, 150)}${aiResponse.length > 150 ? '...' : ''}"`,
        isProcessing: false
      });

      // Brief pause to let user see the response before speaking
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Speak the AI response
      this.speakAIResponse(aiResponse);

      // In continuous mode, automatically start listening after response
      if (this.session.isContinuousMode) {
        const responseLength = aiResponse.length;
        const estimatedSpeakingTime = responseLength * 50 + 3000; // Estimate + buffer

        setTimeout(() => {
          if (this.session?.isActive && this.session.isContinuousMode && !this.isProcessingResponse) {
            console.log('🔄 Continuous mode: Auto-starting listening after response');
            this.startListening();
          }
        }, estimatedSpeakingTime);
      }

    } catch (error) {
      console.error('🚨 Error processing user speech:', error);
      this.updateSessionState({ isProcessing: false, preparingResponse: undefined });
      this.speakAIResponse("I'm sorry, I had trouble processing what you said. Could you please try again?");
    } finally {
      this.isProcessingResponse = false;
    }
  }

  // Generate local AI response (fallback)
  private async generateLocalResponse(userInput: string): Promise<string> {
    const input = userInput.toLowerCase();
    const context = systemControlService.getUserContext();

    // Enhanced local intelligence with better context awareness
    if (input.includes('help') || input.includes('stuck') || input.includes('confused') || input.includes('lost')) {
      if (context.enrolledCourses.length === 0) {
        return `I can see you're feeling overwhelmed, and I know exactly why - you haven't enrolled in any courses yet! That's like trying to navigate without a map. Let me fix this right now by enrolling you in our Multi-Agent Systems course. It's designed specifically for students who want clear, step-by-step guidance. After enrollment, I'll activate autonomous mode to personally guide you through every topic. You won't feel lost anymore - I promise!`;
      } else {
        return `I understand you're feeling stuck with ${context.currentCourse || 'your studies'}. This is completely normal - every successful student goes through this! Based on your progress (${context.completedTopics.length} topics completed), I can see you're actually doing better than you think. Let me activate autonomous mode to guide you step-by-step through your next learning phase. I'll break everything down into manageable pieces so you feel confident and in control.`;
      }
    }

    // Course-related queries with enhanced intelligence
    if (input.includes('course') || input.includes('lesson') || input.includes('study') || input.includes('learn')) {
      if (context.enrolledCourses.length === 0) {
        return `Perfect! You're ready to start learning, and I have the perfect course for you. I'm enrolling you in Multi-Agent Systems right now - it's our most popular course because it teaches you how AI systems work together, which is incredibly valuable in today's world. The course has 18 engaging topics across 8 modules, and I'll guide you through each one personally. After enrollment, I'll take you directly to the first topic: "Introduction to Multi-Agent Systems." Ready to begin your learning journey?`;
      } else {
        const courseProgress = Math.round((context.completedTopics.length / 18) * 100); // Assuming 18 total topics
        return `Excellent! You're already enrolled in ${context.currentCourse} and making great progress - you're ${courseProgress}% complete! You've mastered ${context.completedTopics.length} topics, which shows real dedication. Let's keep this momentum going! I can take you to your next topic right now, or if you prefer, I can activate autonomous mode to guide you through the remaining topics automatically. What sounds better to you?`;
      }
    }

    // Progress queries with detailed analysis
    if (input.includes('progress') || input.includes('how am i') || input.includes('performance') || input.includes('doing')) {
      const timeSpentHours = Math.floor(context.performance.totalTimeSpent / 60);
      const timeSpentMinutes = context.performance.totalTimeSpent % 60;

      return `Great question! Let me give you the complete picture of your learning journey. You've completed ${context.completedTopics.length} topics and invested ${timeSpentHours} hours and ${timeSpentMinutes} minutes in active learning - that's real commitment! Your average score is ${context.performance.averageScore}%, which ${context.performance.averageScore >= 80 ? 'is excellent and shows you\'re mastering the material' : context.performance.averageScore >= 60 ? 'shows solid progress with room for improvement' : 'indicates we need to adjust our approach for better results'}. ${context.performance.coursesCompleted > 0 ? `You've completed ${context.performance.coursesCompleted} full course(s) - that's a major achievement!` : 'You\'re building toward your first course completion.'} Should I show you detailed analytics and create a personalized improvement plan?`;
    }

    // Quiz/assessment queries
    if (input.includes('quiz') || input.includes('test') || input.includes('assessment') || input.includes('exam')) {
      if (context.completedTopics.length > 0) {
        return `Excellent idea! Testing yourself is one of the most effective learning strategies. Based on your progress in ${context.currentCourse}, I'll create a personalized quiz covering the ${context.completedTopics.length} topics you've completed. This will help identify your strong areas and topics that need more attention. The quiz will be adaptive - if you're doing well, I'll make it more challenging; if you're struggling, I'll provide more support. Ready to test your knowledge and see how much you've learned?`;
      } else {
        return `I love that you want to test yourself - that's the mindset of a successful learner! However, I notice you haven't completed any topics yet, so let me get you started first. I'll enroll you in a course, and after you complete the first few topics, we can create targeted quizzes to reinforce your learning. This way, the assessments will be meaningful and help you build confidence. Sound like a plan?`;
      }
    }

    // Default enhanced response with context awareness
    const enrollmentStatus = context.enrolledCourses.length === 0 ? 'not enrolled in any courses yet' : `enrolled in ${context.enrolledCourses.length} course(s)`;
    const progressStatus = context.completedTopics.length === 0 ? 'just getting started' : `making progress with ${context.completedTopics.length} topics completed`;

    return `I understand you want to ${userInput}. As your AI learning companion, I'm here to make your educational journey successful and enjoyable. I can see you're ${enrollmentStatus} and ${progressStatus}. Based on your current situation, here's what I recommend: ${context.enrolledCourses.length === 0 ? 'Let me enroll you in our Multi-Agent Systems course right now - it\'s perfect for building strong foundations and will give you clear direction for your learning journey.' : 'Let\'s continue building on your progress! I can take you to your next topic, activate autonomous mode for guided learning, or create a personalized study plan based on your performance.'} What sounds most helpful to you right now?`;
  }

  // Calculate similarity between two strings (0 = different, 1 = identical)
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    let matches = 0;
    for (const word of set1) {
      if (set2.has(word)) matches++;
    }
    
    return matches / Math.max(set1.size, set2.size);
  }

  // Add AI response to blacklist
  private addToBlacklist(text: string) {
    // Extract key phrases from AI response
    const phrases = text.toLowerCase().match(/\b\w+(?:\s+\w+){1,3}\b/g) || [];
    phrases.forEach(phrase => {
      if (phrase.length > 10) { // Only add substantial phrases
        this.aiResponseBlacklist.add(phrase);
      }
    });
    
    // Keep blacklist size manageable (last 20 phrases)
    if (this.aiResponseBlacklist.size > 20) {
      const arr = Array.from(this.aiResponseBlacklist);
      this.aiResponseBlacklist = new Set(arr.slice(-20));
    }
    
    console.log('📝 Blacklist updated. Size:', this.aiResponseBlacklist.size);
  }

  // Speak AI response using text-to-speech
  private speakAIResponse(text: string) {
    if (!this.session) return;

    console.log('🔊 AI starting to speak:', text.substring(0, 50) + '...');
    
    // Store what AI is about to say for filtering
    this.lastAIResponse = text;
    this.addToBlacklist(text);
    
    // CRITICAL: MUTE MICROPHONE - Stop and abort recognition completely
    if (this.recognition && this.isRecognitionActive) {
      console.log('🔇 MUTING MICROPHONE - Aborting speech recognition');
      try {
        this.recognition.abort(); // Force stop immediately
      } catch (e) {
        console.log('Recognition already stopped');
      }
      this.isRecognitionActive = false;
    }
    
    // Clear any pending transcripts
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.clearTimeouts();
    
    this.updateSessionState({ isSpeaking: true, waitingForUser: false, isListening: false });

    textToSpeechService.speak(text, {
      onStart: () => {
        console.log('🔊 AI speech started - MIC IS MUTED');
        // Double-check mic is muted
        if (this.recognition && this.isRecognitionActive) {
          try {
            this.recognition.abort();
          } catch (e) {
            // Already stopped
          }
          this.isRecognitionActive = false;
        }
      },
      onEnd: () => {
        console.log('✅ AI speech ended - UNMUTING MICROPHONE');
        this.updateSessionState({ isSpeaking: false });

        // UNMUTE MICROPHONE - Restart recognition after delay
        setTimeout(() => {
          if (this.session?.isActive && !this.isProcessingResponse) {
            console.log('🎤 UNMUTING - Restarting speech recognition');
            this.startListening();
          }
        }, 2000); // 2 second delay to ensure TTS audio is completely finished
      },
      onError: (error) => {
        if (error !== 'interrupted' && error !== 'canceled') {
          console.error('🚨 TTS error details:', error);
        } else {
          console.log('ℹ️ TTS interrupted or canceled');
        }
        this.updateSessionState({ isSpeaking: false });

        // UNMUTE even on error
        if (this.session?.isActive && !this.isProcessingResponse) {
          setTimeout(() => {
            console.log('🎤 UNMUTING after error - Restarting speech recognition');
            this.startListening();
          }, 2000);
        }
      }
    });
  }

  // Update session state
  private updateSessionState(updates: Partial<VoiceChatSession>) {
    if (this.session) {
      Object.assign(this.session, updates);
    }
  }

  // Get current session
  getCurrentSession(): VoiceChatSession | null {
    return this.session;
  }

  // Check if voice chat is supported
  isVoiceChatSupported(): boolean {
    return this.isInitialized && !!this.recognition;
  }

  // Set language for speech recognition
  setLanguage(language: string) {
    if (this.recognition) {
      const langMap: Record<string, string> = {
        'English': 'en-US',
        'Igbo': 'en-NG', // Use English Nigeria for better recognition
        'Hausa': 'en-NG',
        'Yoruba': 'en-NG'
      };

      this.recognition.lang = langMap[language] || 'en-US';
    }
  }

  // Set Grok API key
  setGrokApiKey(apiKey: string) {
    grokAIService.setApiKey(apiKey);
  }

  // Get interim transcript for real-time display
  getInterimTranscript(): string {
    return this.interimTranscript;
  }

  // Force stop current speech and start listening
  interruptAndListen() {
    if (this.session?.isSpeaking) {
      textToSpeechService.stop();
      this.updateSessionState({ isSpeaking: false });
    }

    setTimeout(() => {
      this.startListening();
    }, 500);
  }
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const voiceChatService = new VoiceChatService();
