'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Sparkles, Globe, HelpCircle } from 'lucide-react';
import { voiceChatService, VoiceChatSession } from '@/services/voiceChatService';

export const GeminiLiveAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<VoiceChatSession | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isMuted, setIsMuted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Helper functions
  function startAssistant() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('alia-live-assistant-open', 'true');
      }
      voiceChatService.setLanguage(language);
      const newSession = voiceChatService.startVoiceChat(true); // Always Agentic Mode for Live Tutor
      setSession(newSession);
    } catch (err) {
      console.error('Failed to start voice chat:', err);
    }
  }

  function stopAssistant() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alia-live-assistant-open', 'false');
    }
    voiceChatService.stopVoiceChat();
    setSession(null);
  }

  function toggleOpen() {
    if (isOpen) {
      stopAssistant();
      setIsOpen(false);
    } else {
      setIsOpen(true);
      startAssistant();
    }
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    voiceChatService.setLanguage(lang);
  }

  function toggleMute() {
    if (isMuted) {
      voiceChatService.startListening();
    } else {
      voiceChatService.stopListening();
    }
    setIsMuted(!isMuted);
  }

  function handleSuggestionClick(text: string) {
    if (session?.isActive && !session.isProcessing) {
      // Simulate speech input
      voiceChatService.sendQuery(text);
    }
  }

  function getAssistantState() {
    if (!session?.isActive) return 'idle';
    if (session.isProcessing) return 'thinking';
    if (session.isSpeaking) return 'speaking';
    if (session.isListening) return 'listening';
    return 'idle';
  }

  const activeState = getAssistantState();

  useEffect(() => {
    setIsClient(true);
    setIsSupported(voiceChatService.isVoiceChatSupported());
    
    // Check if the assistant should be open based on localStorage
    if (typeof window !== 'undefined') {
      const persistedOpen = localStorage.getItem('alia-live-assistant-open') === 'true';
      const savedSessionStr = localStorage.getItem('alia-voice-session');
      if (persistedOpen && savedSessionStr) {
        try {
          const savedSession = JSON.parse(savedSessionStr);
          const savedTime = savedSession.timestamp ? new Date(savedSession.timestamp).getTime() : 0;
          const now = Date.now();
          // If the saved session is less than 10 minutes old, restore it!
          if (savedSession.isActive && (now - savedTime) < 10 * 60 * 1000) {
            setIsOpen(true);
            const activeSession = voiceChatService.startVoiceChat(true);
            setSession(activeSession);
          }
        } catch (e) {
          console.error('Error restoring session on mount:', e);
        }
      }
    }
  }, []);

  // Sync API keys and handle initial setup
  useEffect(() => {
    if (!isClient) return;

    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      voiceChatService.setGeminiApiKey(geminiKey);
    }

    const grokKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
    if (grokKey) {
      voiceChatService.setGrokApiKey(grokKey);
    }
  }, [isClient]);

  // Sync voice chat session state
  useEffect(() => {
    if (!isClient || !isOpen) return;

    const interval = setInterval(() => {
      const currentSession = voiceChatService.getCurrentSession();
      if (currentSession) {
        setSession({ ...currentSession });
      }
      setInterimTranscript(voiceChatService.getInterimTranscript());
    }, 150);

    return () => clearInterval(interval);
  }, [isClient, isOpen]);

  // Handle window events for opening the live assistant
  useEffect(() => {
    if (!isClient) return;

    const handleOpen = () => {
      setIsOpen(true);
      startAssistant();
    };

    window.addEventListener('open-alia-live', handleOpen);

    // Keyboard Hotkey (Ctrl + L to toggle)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) {
            startAssistant();
            return true;
          } else {
            stopAssistant();
            return false;
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-alia-live', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, language]);

  if (!isClient) return null;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {isSupported && (
        <button
          onClick={toggleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 animate-pulse border border-indigo-400"
          title="Talk to ALIA Live"
        >
          <Mic className="w-6 h-6" />
        </button>
      )}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/85 backdrop-blur-xl text-white font-sans p-6 sm:p-10 select-none overflow-hidden"
          >
            {/* CSS Custom Keyframe Animations */}
            <style jsx global>{`
              @keyframes morph {
                0% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; transform: scale(1); }
                50% { border-radius: 60% 40% 40% 60% / 60% 60% 40% 40%; transform: scale(1.08); }
                100% { border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; transform: scale(1); }
              }
              @keyframes rotate {
                100% { transform: rotate(360deg); }
              }
              @keyframes bounceBar {
                0%, 100% { transform: scaleY(0.3); }
                50% { transform: scaleY(1.3); }
              }
              .alia-orb {
                animation: morph 6s ease-in-out infinite;
                background: linear-gradient(135deg, #818cf8 0%, #3b82f6 50%, #06b6d4 100%);
                filter: drop-shadow(0 0 25px rgba(99, 102, 241, 0.6));
              }
              .alia-glow-ring {
                animation: rotate 4s linear infinite;
                border: 2px dashed rgba(129, 140, 248, 0.4);
              }
              .audio-bar {
                animation: bounceBar 1.2s ease-in-out infinite;
                transform-origin: bottom;
              }
            `}</style>

            {/* Top Bar */}
            <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
                <span className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
                  ALIA Live Tutor Session
                </span>
              </div>
              <button
                onClick={toggleOpen}
                className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all hover:scale-105 active:scale-95"
                aria-label="Close Live Tutor"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Middle Assistant State Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-2xl mx-auto my-6">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* 1. Listening State (Morphing Pulsing Orb) */}
                {activeState === 'listening' && (
                  <div className="alia-orb w-48 h-48 transition-all duration-500 flex items-center justify-center">
                    <Mic className="w-16 h-16 text-white animate-pulse" />
                  </div>
                )}

                {/* 2. Thinking State (Rotating Ring) */}
                {activeState === 'thinking' && (
                  <div className="relative w-52 h-52 flex items-center justify-center">
                    <div className="alia-glow-ring absolute inset-0 rounded-full" />
                    <div className="w-40 h-40 rounded-full bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-12 h-12 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                )}

                {/* 3. Speaking State (Dynamic Soundwaves) */}
                {activeState === 'speaking' && (
                  <div className="flex items-end justify-center gap-2.5 h-36 w-60">
                    {[
                      { height: 'h-24', color: 'bg-indigo-400', delay: '0s' },
                      { height: 'h-32', color: 'bg-blue-400', delay: '0.15s' },
                      { height: 'h-20', color: 'bg-cyan-400', delay: '0.3s' },
                      { height: 'h-36', color: 'bg-purple-400', delay: '0.45s' },
                      { height: 'h-28', color: 'bg-pink-400', delay: '0.6s' },
                      { height: 'h-32', color: 'bg-blue-400', delay: '0.75s' },
                      { height: 'h-24', color: 'bg-indigo-400', delay: '0.9s' }
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className={`w-3.5 rounded-full audio-bar ${bar.height} ${bar.color}`}
                        style={{ animationDelay: bar.delay }}
                      />
                    ))}
                  </div>
                )}

                {/* 4. Idle/Paused State */}
                {activeState === 'idle' && (
                  <button
                    onClick={startAssistant}
                    className="w-44 h-44 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  >
                    <Mic className="w-10 h-10 text-slate-400" />
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tap to Speak</span>
                  </button>
                )}
              </div>

              {/* Status & Subtitles Card */}
              <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold border-b border-slate-800 pb-3">
                  <span>CAPTIONS & TRANSCRIBED TEXT</span>
                  <span className="uppercase text-indigo-400">
                    {activeState === 'listening' ? 'Listening...' : activeState === 'speaking' ? 'Speaking...' : activeState === 'thinking' ? 'Thinking...' : 'Idle'}
                  </span>
                </div>

                <div className="h-32 overflow-y-auto px-1 space-y-3 scrollbar-thin">
                  {/* Interim Speech (Real-time Feedback) */}
                  {interimTranscript && (
                    <p className="text-lg text-slate-300 italic">
                      &ldquo;{interimTranscript}&rdquo;
                    </p>
                  )}

                  {/* AI Response Subtitles */}
                  {!interimTranscript && session?.conversationHistory && session.conversationHistory.length > 0 ? (
                    <div className="space-y-3">
                      {session.conversationHistory.slice(-2).map((msg, idx) => (
                        <p
                          key={idx}
                          className={`text-base leading-relaxed ${msg.role === 'user' ? 'text-slate-400' : 'text-white font-medium'}`}
                        >
                          {msg.role === 'user' ? 'You: ' : 'ALIA: '}
                          {msg.content}
                        </p>
                      ))}
                    </div>
                  ) : (
                    !interimTranscript && (
                      <p className="text-slate-500 text-sm text-center py-6">
                        No voice inputs detected yet. Say &quot;Hey ALIA, what courses are available?&quot; or ask about learning progress.
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section (Action Chips & Controls) */}
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'What courses do you have?',
                  'Explain artificial intelligence simply',
                  'Am I doing well with my courses?',
                  'Take a quick quiz'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(chip)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900/90 border border-slate-800 hover:border-indigo-500 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>✦</span> {chip}
                  </button>
                ))}
              </div>

              {/* Control Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-900 pt-6">
                {/* Language Select */}
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-full">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="English" className="bg-slate-950 text-white">English</option>
                    <option value="Yoruba" className="bg-slate-950 text-white">Yoruba</option>
                    <option value="Igbo" className="bg-slate-950 text-white">Igbo</option>
                    <option value="Hausa" className="bg-slate-950 text-white">Hausa</option>
                  </select>
                </div>

                {/* Mic & Control Buttons */}
                <div className="flex items-center gap-3">
                  {/* Interrupt Button */}
                  {activeState === 'speaking' && (
                    <button
                      onClick={() => voiceChatService.interruptAndListen()}
                      className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-all hover:scale-105"
                    >
                      Interrupt
                    </button>
                  )}

                  {/* Mic Toggle */}
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full border transition-all hover:scale-105 ${isMuted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                    title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>

                {/* Help Indicator */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <HelpCircle className="w-4 h-4" />
                  <span>Hotkey: Press <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-[10px]">Ctrl + L</kbd> to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
