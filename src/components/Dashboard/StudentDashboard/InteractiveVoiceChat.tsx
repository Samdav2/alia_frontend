'use client';

import React, { useState, useEffect, useRef } from 'react';
import { voiceChatService, VoiceChatSession, VoiceChatMessage } from '@/services/voiceChatService';
import { textToSpeechService } from '@/services/textToSpeechService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

export const InteractiveVoiceChat: React.FC = () => {
  const [session, setSession] = useState<VoiceChatSession | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [grokApiKey, setGrokApiKey] = useState('');
  const [isAgenticMode, setIsAgenticMode] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { showNotification } = useVisualNotification();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setIsSupported(voiceChatService.isVoiceChatSupported());

    // Load saved Grok API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
    if (apiKey) {
      setGrokApiKey(apiKey);
      voiceChatService.setGrokApiKey(apiKey);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.conversationHistory, isClient]);

  useEffect(() => {
    if (!isClient) return;
    // Update session state and interim transcript periodically
    const interval = setInterval(() => {
      const currentSession = voiceChatService.getCurrentSession();
      if (currentSession) {
        setSession({ ...currentSession });

        // Auto-resume continuous mode if session is active but component just mounted
        if (currentSession.isActive && currentSession.isContinuousMode && !currentSession.isListening && !currentSession.isSpeaking) {
          console.log('🔄 Re-attaching to active continuous session...');
          voiceChatService.startListening();
        }
      }

      // Update interim transcript for real-time display
      const interim = voiceChatService.getInterimTranscript();
      setInterimTranscript(interim);
    }, 200); // More frequent updates for better UX

    return () => clearInterval(interval);
  }, [isClient]);

  // Show loading state on server-side or while initializing
  if (!isClient) {
    return (
      <div className="min-h-screen soft-gradient-bg flex items-center justify-center">
        <div className="glass-card rounded-[32px] p-8 text-center">
          <div className="text-6xl mb-6">🎤</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Loading Voice Chat...</h2>
          <p className="text-slate-600 font-medium">
            Preparing your intelligent voice assistant
          </p>
        </div>
      </div>
    );
  }
  const startVoiceChat = () => {
    if (!isSupported) {
      showNotification('Voice chat is not supported in your browser', 'error');
      return;
    }

    try {
      voiceChatService.setLanguage(currentLanguage);
      const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
      if (apiKey) {
        voiceChatService.setGrokApiKey(apiKey);
      }
      const newSession = voiceChatService.startVoiceChat(isAgenticMode);
      setSession(newSession);
      showNotification(`${isAgenticMode ? 'Agentic' : 'Standard'} voice chat started! 🎤`, 'success');
    } catch (error) {
      console.error('Error starting voice chat:', error);
      showNotification('Failed to start voice chat', 'error');
    }
  };

  const stopVoiceChat = () => {
    voiceChatService.stopVoiceChat();
    setSession(null);
    showNotification('Voice chat ended', 'info');
  };

  const startListening = () => {
    if (session?.isActive) {
      voiceChatService.startListening();
    }
  };

  const stopListening = () => {
    voiceChatService.stopListening();
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    voiceChatService.setLanguage(language);
    textToSpeechService.setLanguage(language);
    showNotification(`Language changed to ${language}`, 'success');
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen soft-gradient-bg flex items-center justify-center p-4">
        <div className="glass-card rounded-[32px] p-8 text-center max-w-md border-red-100">
          <div className="text-6xl mb-6">🎤❌</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Voice Chat Not Supported</h2>
          <p className="text-slate-600 font-medium mb-6">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen soft-gradient-bg">
      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="glass-card rounded-b-[24px] sm:rounded-b-[32px] p-4 sm:p-6 lg:p-8 border-b border-white/60 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-black shadow-lg transition-all ${session?.isActive
                ? session.isAgenticMode
                  ? 'bg-gradient-to-br from-purple-500 to-blue-600 animate-pulse'
                  : 'bg-gradient-to-br from-green-500 to-blue-600 animate-pulse'
                : 'bg-gradient-to-br from-slate-400 to-slate-600'
                }`}>
                {session?.isAgenticMode ? '🤖' : '🎤'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {session?.isAgenticMode ? 'Agentic' : 'Interactive'} <span className="text-blue-600">Voice Chat</span>
                </h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 font-bold">
                  {session?.isActive
                    ? session.isContinuousMode
                      ? '🔄 Continuous mode active - I\'ll keep helping until you say stop'
                      : session.isAgenticMode
                        ? 'AI proactively guiding your learning'
                        : 'Voice chat active'
                    : 'Voice chat inactive'
                  }
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2 sm:gap-3">
              {session?.isContinuousMode && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold hidden sm:inline">Continuous</span>
                </div>
              )}
              {session?.currentAction && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold hidden sm:inline">Active</span>
                </div>
              )}
              {session?.isListening && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold hidden sm:inline">Listening</span>
                </div>
              )}
              {session?.isSpeaking && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold hidden sm:inline">Speaking</span>
                </div>
              )}
              <div className={`w-2 h-2 rounded-full ${session?.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
            </div>
          </div>

          {/* Grok API Status */}
          {!session?.isActive && process.env.NEXT_PUBLIC_GROK_API_KEY && (
            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold text-green-800">🚀 Grok AI Connected</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Advanced AI responses enabled for intelligent conversations
              </p>
            </div>
          )}
          {/* Mode Selection */}
          {!session?.isActive && (
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Mode:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAgenticMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isAgenticMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/60 text-slate-600 hover:bg-white'
                      }`}
                  >
                    🤖 Agentic (Proactive)
                  </button>
                  <button
                    onClick={() => setIsAgenticMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!isAgenticMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/60 text-slate-600 hover:bg-white'
                      }`}
                  >
                    💬 Standard
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {isAgenticMode
                  ? '🤖 Agentic mode: I proactively suggest what you should do next and guide your learning journey'
                  : '💬 Standard mode: I respond to your questions and requests'
                }
              </p>
            </div>
          )}

          {/* Language Selection */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Language:</span>
            <div className="flex gap-2">
              {['English', 'Igbo', 'Hausa', 'Yoruba'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentLanguage === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                    }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!session?.isActive ? (
              <button
                onClick={startVoiceChat}
                className={`flex-1 sm:flex-none px-6 py-3 text-white rounded-xl font-bold hover:shadow-xl transition-all hover-lift ${isAgenticMode
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                  : 'bg-gradient-to-r from-green-500 to-blue-600'
                  }`}
              >
                {isAgenticMode ? '🤖 Start Agentic Chat' : '🎤 Start Voice Chat'}
              </button>
            ) : (
              <>
                <button
                  onClick={stopVoiceChat}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all text-sm"
                >
                  ⏹️ Stop Chat
                </button>
                {session.isContinuousMode && (
                  <button
                    onClick={() => voiceChatService.stopContinuousMode()}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all text-sm"
                  >
                    ⏸️ Stop Continuous
                  </button>
                )}
                {!session.isContinuousMode && session.isActive && session.isAgenticMode && (
                  <button
                    onClick={() => voiceChatService.resumeContinuousMode()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all text-sm"
                  >
                    ▶️ Resume Continuous
                  </button>
                )}
                <button
                  onClick={session.isListening ? stopListening : startListening}
                  disabled={session.isSpeaking}
                  className={`px-4 py-2 rounded-lg font-bold transition-all text-sm disabled:opacity-50 ${session.isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                  {session.isListening ? '🔇 Stop Listening' : '🎤 Start Listening'}
                </button>
              </>
            )}
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 pb-4">
          {!session?.isActive ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6">{isAgenticMode ? '🤖💬' : '🎤💬'}</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">
                  Ready for {isAgenticMode ? 'Agentic' : 'Interactive'} Voice Chat?
                </h3>
                <p className="text-slate-600 font-medium mb-6">
                  {isAgenticMode
                    ? 'Start an intelligent conversation where I proactively guide your learning journey. I\'ll suggest what to do next and help you achieve your goals!'
                    : 'Start an interactive voice conversation with ALIA. Ask questions, get explanations, request study help, or just have a natural conversation about your learning!'
                  }
                </p>
                <div className="space-y-3 text-sm text-slate-500">
                  <p>💡 <strong>Try saying:</strong></p>
                  <div className="space-y-1">
                    {isAgenticMode ? (
                      <>
                        <p>"I want to improve my grades"</p>
                        <p>"What should I focus on today?"</p>
                        <p>"Help me create a study plan"</p>
                        <p>"I'm struggling with this topic"</p>
                      </>
                    ) : (
                      <>
                        <p>"Explain multi-agent systems to me"</p>
                        <p>"Quiz me on machine learning"</p>
                        <p>"What courses should I focus on?"</p>
                        <p>"Help me with my studies"</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {session.conversationHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${message.role === 'user'
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600'
                    }`}>
                    {message.role === 'user' ? '🎤' : 'A'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`glass-card rounded-2xl p-4 ${message.role === 'user'
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-white/80 text-slate-900 border-white/60'
                      }`}>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${message.role === 'user' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {message.role === 'user' && message.transcription && (
                          <span className="text-xs text-slate-400">🎤 Voice</span>
                        )}
                      </div>

                      {/* AI Suggestions and Actions */}
                      {message.role === 'assistant' && (
                        <div className="mt-3 space-y-3">
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-blue-600 mb-2">💡 My Suggestions:</p>
                              <div className="space-y-2">
                                {message.suggestions.map((suggestion, idx) => (
                                  <div key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                                    <span className="font-bold">{idx + 1}.</span> {suggestion}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          {message.actions && message.actions.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-purple-600 mb-2">🚀 Actions I Can Take:</p>
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

                          {/* Next Steps */}
                          {message.role === 'assistant' && session.isAgenticMode && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-700 mb-1">🎯 What's Next:</p>
                              <p className="text-xs text-green-600">
                                I'm ready to take action immediately! Just say "yes" or "do it" and I'll help you succeed.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Real-time Status Display */}
              {session.waitingForUser && (
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold animate-pulse">
                    👂
                  </div>
                  <div className="glass-card rounded-2xl p-4 bg-green-50/80 border-2 border-green-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-green-700">Waiting for you to speak...</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">I'm ready to listen and take action!</p>
                  </div>
                </div>
              )}

              {/* Interim Transcript Display */}
              {interimTranscript && session.isListening && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold">
                    🎤
                  </div>
                  <div className="glass-card rounded-2xl p-4 bg-slate-100/80 border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-blue-600">I hear you speaking...</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 italic">
                      "{interimTranscript}"
                    </p>
                  </div>
                </div>
              )}

              {/* AI Preparing Response with Preview */}
              {session.isProcessing && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    🧠
                  </div>
                  <div className="glass-card rounded-2xl p-4 bg-purple-50/80 border-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm font-bold text-purple-700">Preparing intelligent response...</span>
                    </div>
                    <p className="text-xs text-purple-600">
                      {session.preparingResponse || 'Analyzing your request with full system access...'}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Response Preview (like autonomous mode) */}
              {session.preparingResponse && session.preparingResponse.startsWith('About to say:') && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white font-bold animate-pulse">
                    👁️
                  </div>
                  <div className="glass-card rounded-2xl p-4 bg-green-50/80 border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-green-700">Preview - What I'm about to say:</span>
                    </div>
                    <div className="text-sm text-green-600 bg-white/60 rounded-lg p-3 border border-green-200">
                      <p className="italic">
                        {session.preparingResponse.replace('About to say: "', '').replace('"', '')}
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      I'll start speaking in a moment. Get ready to listen!
                    </p>
                  </div>
                </div>
              )}

              {/* AI Speaking Indicator with Preview */}
              {session.isSpeaking && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold animate-pulse">
                    🔊
                  </div>
                  <div className="glass-card rounded-2xl p-4 bg-green-50/80 border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-green-700">I'm speaking now...</span>
                    </div>
                    {session.conversationHistory.length > 0 && (
                      <div className="text-sm text-green-600 bg-white/60 rounded-lg p-3 border border-green-200">
                        <p className="font-medium mb-1">Currently saying:</p>
                        <p className="text-xs italic">
                          "{session.conversationHistory[session.conversationHistory.length - 1]?.content.substring(0, 150)}..."
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-green-600 mt-2">
                      {session.isAgenticMode
                        ? 'Taking action to help you succeed! Please listen carefully.'
                        : 'Please wait for me to finish speaking before responding.'
                      }
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Instructions */}
        {session?.isActive && (
          <div className="glass-card rounded-t-[24px] sm:rounded-t-[32px] p-4 sm:p-6 border-t border-white/60">
            <div className="text-center">
              <p className="text-xs text-slate-500 mt-2">
                {session.isContinuousMode
                  ? '🔄 Continuous mode active - I\'ll keep helping until you say "stop continuous mode"'
                  : session.isSpeaking
                    ? '🔊 I\'m speaking... Please wait for me to finish'
                    : session.isListening
                      ? interimTranscript
                        ? '🎤 Keep speaking... I\'m understanding you!'
                        : session.waitingForUser
                          ? '🎤 I\'m ready! Please speak now...'
                          : '🎤 Listening... Speak clearly!'
                      : session.isAgenticMode
                        ? '🤖 Ready to take action! Click "Start Listening" and tell me what you need!'
                        : '💬 Click "Start Listening" to ask me anything!'
                }
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                {session.isContinuousMode
                  ? 'Say "stop continuous mode" to pause, or "stop voice chat" to end completely'
                  : session.isAgenticMode
                    ? 'Agentic mode: I have full system access and will take immediate action to help you'
                    : 'Voice chat works best in quiet environments. Speak clearly and naturally.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
