'use client';

import React, { useState, useRef, useEffect } from 'react';
import { textToSpeechService } from '@/services/textToSpeechService';
import { grokAIService } from '@/services/grokAIService';
import { systemControlService } from '@/services/systemControlService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: any[];
}

export const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m ALIA, your super-intelligent AI learning assistant powered by advanced AI. I have full access to your learning data and can take immediate action to help you succeed. I can help you with course content, answer questions, explain concepts, enroll you in courses, start lessons, and provide personalized study guidance. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Show me my current progress',
        'Help me choose a course to study',
        'Explain a difficult concept',
        'Create a study plan for me'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Grok AI with user context
  useEffect(() => {
    if (grokAIService.isConfigured()) {
      // Update Grok with current user context
      const context = systemControlService.getUserContext();
      const grokContext = {
        currentCourse: context.currentCourse,
        completedTopics: context.completedTopics,
        learningGoals: [],
        preferences: {
          language: context.preferences.language,
          learningStyle: 'visual',
          difficulty: 'intermediate'
        },
        performance: {
          averageScore: context.performance.averageScore,
          timeSpent: context.performance.totalTimeSpent,
          strugglingTopics: []
        }
      };
      grokAIService.updateUserContext(grokContext);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);
    setIsProcessing(true);

    try {
      let aiResponse = '';
      let suggestions: string[] = [];
      let actions: any[] = [];

      // Use Grok AI for intelligent responses
      if (grokAIService.isConfigured()) {
        console.log('🤖 Using Grok AI for chat response...');

        // Update context before generating response
        systemControlService.updateContext();
        const context = systemControlService.getUserContext();
        const grokContext = {
          currentCourse: context.currentCourse,
          completedTopics: context.completedTopics,
          learningGoals: [],
          preferences: {
            language: context.preferences.language,
            learningStyle: 'visual',
            difficulty: 'intermediate'
          },
          performance: {
            averageScore: context.performance.averageScore,
            timeSpent: context.performance.totalTimeSpent,
            strugglingTopics: []
          }
        };

        grokAIService.updateUserContext(grokContext);
        const grokResponse = await grokAIService.generateAgenticResponse(currentInput);

        aiResponse = grokResponse.response;
        suggestions = grokResponse.suggestions;
        actions = grokResponse.actions;

        console.log('✅ Grok AI response generated successfully');
      } else {
        // Enhanced fallback response
        aiResponse = await generateEnhancedLocalResponse(currentInput);
        suggestions = generateSmartSuggestions(currentInput);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        suggestions: suggestions,
        actions: actions
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optional: Read response aloud
      // textToSpeechService.announce(aiResponse);

    } catch (error) {
      console.error('❌ Error generating AI response:', error);

      // Fallback error response
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an issue processing your request about "${currentInput}". Let me try to help you in a different way. Could you please rephrase your question or let me know what specific aspect you'd like me to focus on?`,
        timestamp: new Date(),
        suggestions: [
          'Try asking in a different way',
          'Ask about your current courses',
          'Request help with a specific topic',
          'Check your learning progress'
        ]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  // Enhanced local response generation
  const generateEnhancedLocalResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();
    const context = systemControlService.getUserContext();

    if (input.includes('progress') || input.includes('performance') || input.includes('how am i')) {
      const timeSpentHours = Math.floor(context.performance.totalTimeSpent / 60);
      const timeSpentMinutes = context.performance.totalTimeSpent % 60;

      return `Great question! Here's your complete learning overview: You've completed ${context.completedTopics.length} topics and invested ${timeSpentHours} hours and ${timeSpentMinutes} minutes in active learning. Your average score is ${context.performance.averageScore}%, and you've completed ${context.performance.coursesCompleted} full course(s). ${context.enrolledCourses.length === 0 ? 'I notice you\'re not enrolled in any courses yet - would you like me to recommend and enroll you in a course that matches your interests?' : `You're currently enrolled in ${context.enrolledCourses.length} course(s) and making excellent progress!`}`;
    }

    if (input.includes('course') || input.includes('enroll') || input.includes('study')) {
      if (context.enrolledCourses.length === 0) {
        return `Perfect! I can help you get started with learning right away. Based on current trends and student success rates, I highly recommend our Multi-Agent Systems course - it's designed to teach you how AI systems work together, which is incredibly valuable in today's tech landscape. The course covers 18 engaging topics across 8 comprehensive modules. Would you like me to enroll you right now and take you to the first lesson?`;
      } else {
        return `Excellent! You're already enrolled in ${context.enrolledCourses.length} course(s) and have completed ${context.completedTopics.length} topics. Your dedication is impressive! Would you like to continue with your current course, or are you interested in exploring additional courses to expand your knowledge even further?`;
      }
    }

    if (input.includes('help') || input.includes('stuck') || input.includes('confused')) {
      return `I completely understand - learning can sometimes feel overwhelming, but you're not alone in this journey! Based on your current situation, here's what I can do to help you right away: ${context.enrolledCourses.length === 0 ? 'First, let\'s get you enrolled in a structured course that will provide clear direction and build your confidence step by step.' : 'Let\'s review your progress and identify the specific areas where you need support, then create a personalized action plan to get you back on track.'} I'm here to guide you through every step of the process!`;
    }

    if (input.includes('quiz') || input.includes('test') || input.includes('assessment')) {
      if (context.completedTopics.length > 0) {
        return `Excellent idea! Testing yourself is one of the most effective learning strategies. Based on your progress, I can create a personalized quiz covering the ${context.completedTopics.length} topics you've completed. This will help identify your strong areas and topics that might need more attention. The quiz will be adaptive - adjusting difficulty based on your performance. Would you like me to generate a comprehensive assessment for you right now?`;
      } else {
        return `I love that you want to test your knowledge! However, I notice you haven't completed any topics yet. Let me help you get started with some learning content first, and then we can create targeted quizzes to reinforce what you've learned. This approach will make the assessments more meaningful and help build your confidence. Shall we begin with enrolling you in a course?`;
      }
    }

    // Default intelligent response
    return `I understand you're asking about "${userInput}". As your AI learning companion with full system access, I'm here to provide personalized assistance based on your unique learning journey. ${context.enrolledCourses.length === 0 ? 'I notice you haven\'t enrolled in any courses yet - this is a great opportunity to start your learning adventure! I can recommend the perfect course for your interests and goals.' : `You're making great progress with ${context.completedTopics.length} topics completed. Let's continue building on your success!`} What specific aspect would you like me to help you with today?`;
  };

  // Generate smart suggestions based on input
  const generateSmartSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    const context = systemControlService.getUserContext();

    if (input.includes('progress') || input.includes('performance')) {
      return [
        'Show me detailed analytics',
        'Create a study improvement plan',
        'Compare my progress with others',
        'Set new learning goals'
      ];
    }

    if (input.includes('course') || input.includes('study')) {
      return context.enrolledCourses.length === 0 ? [
        'Enroll me in Multi-Agent Systems',
        'Show me all available courses',
        'Help me choose the right course',
        'Start with a beginner-friendly course'
      ] : [
        'Continue my current course',
        'Enroll in an additional course',
        'Review challenging topics',
        'Take a practice quiz'
      ];
    }

    if (input.includes('help') || input.includes('stuck')) {
      return [
        'Create a personalized study plan',
        'Explain this concept differently',
        'Find additional learning resources',
        'Connect me with study groups'
      ];
    }

    return [
      'Show my learning dashboard',
      'Recommend next steps',
      'Explain a concept',
      'Start a practice session'
    ];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    '📊 Show my progress',
    '📚 Recommend a course',
    '❓ Quiz me on topics',
    '💡 Explain concepts',
    '🎯 Create study plan',
    '🚀 Start learning now'
  ];

  return (
    <div className="min-h-screen soft-gradient-bg">
      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="glass-card rounded-b-[24px] sm:rounded-b-[32px] p-4 sm:p-6 lg:p-8 border-b border-white/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl animate-float shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  AI <span className="text-blue-600">Chat</span>
                </h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 font-bold">
                  {grokAIService.isConfigured() ? '🚀 Powered by Grok AI - Super Intelligence' : 'Powered by ALIA Intelligence'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {grokAIService.isConfigured() && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold hidden sm:inline">Grok AI</span>
                </div>
              )}
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-600 hidden sm:inline">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area - with proper spacing for mobile bottom nav */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 lg:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base ${message.role === 'user'
                  ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
                }`}>
                {message.role === 'user' ? '👤' : 'A'}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`glass-card rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 ${message.role === 'user'
                    ? 'bg-slate-900 text-white border-slate-800'
                    : 'bg-white/80 text-slate-900 border-white/60'
                  }`}>
                  <p className="text-xs sm:text-sm lg:text-base font-medium leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-[9px] sm:text-[10px] lg:text-xs mt-2 ${message.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>

                  {/* AI Suggestions and Actions */}
                  {message.role === 'assistant' && (
                    <div className="mt-3 space-y-3">
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-blue-600 mb-2">💡 Smart Suggestions:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => setInput(suggestion)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium border border-blue-200 transition-all hover:scale-105 text-left"
                              >
                                <span className="font-bold">{idx + 1}.</span> {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-purple-600 mb-2">🚀 Available Actions:</p>
                          <div className="space-y-2">
                            {message.actions.map((action, idx) => (
                              <div key={idx} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {idx + 1}
                                  </span>
                                  <span>{action.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                🧠
              </div>
              <div className="glass-card rounded-2xl p-4 bg-purple-50/80 border-2 border-purple-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm font-bold text-purple-700">Analyzing with super intelligence...</span>
                </div>
                <p className="text-xs text-purple-600">
                  {grokAIService.isConfigured()
                    ? 'Using Grok AI to understand your request and provide personalized guidance...'
                    : 'Processing your request with advanced AI capabilities...'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !isProcessing && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="glass-card rounded-2xl p-4 bg-white/80">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-3 sm:px-4 lg:px-6 pb-2 sm:pb-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="flex-shrink-0 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white/60 hover:bg-white border border-white/80 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold text-slate-700 hover:text-blue-600 transition-all hover-lift whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - with increased spacing for mobile bottom nav and accessibility button */}
        <div className="glass-card rounded-t-[24px] sm:rounded-t-[32px] p-3 sm:p-4 lg:p-6 border-t border-white/60 mb-20 lg:mb-0">
          <div className="flex gap-2 sm:gap-3 lg:gap-4 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask ALIA anything..."
              className="flex-1 bg-white/60 border border-white/80 rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] sm:min-h-[48px] max-h-32"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl lg:text-2xl hover:shadow-xl transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↑
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 mt-2 sm:mt-3 text-center font-medium">
            ALIA can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};
