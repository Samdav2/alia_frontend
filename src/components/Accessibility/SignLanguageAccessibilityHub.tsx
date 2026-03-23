'use client';

import React, { useState } from 'react';
import SignInterpreter from './SignInterpreter';
import SignAvatar from './SignAvatar';
import { ReadAloud } from './ReadAloud';
import { useSignNavigation } from '@/hooks/useSignNavigation';

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║    Integrated Sign Language + Text-to-Speech Accessibility    ║
 * ║              Complete Hub for Deaf/HoH Students                ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

interface SignMessage {
  id: string;
  sign: string;
  timestamp: number;
  response: string;
}

const SignLanguageAccessibilityHub: React.FC = () => {
  const [detectedSigns, setDetectedSigns] = useState<SignMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('HELLO');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [conversationText, setConversationText] = useState('');

  // Initialize the Navigation Engine
  const { executeCommand } = useSignNavigation();

  // ── Handle Detected Sign ──
  const handleSignDetected = (sign: string) => {
    // 1. Pass the sign to the Navigation Engine to trigger scrolls/clicks/navigation
    executeCommand(sign);

    // 2. Do standard state updates (History, Avatar, TTS)
    const newMessage: SignMessage = {
      id: `${Date.now()}-${sign}`,
      sign,
      timestamp: Date.now(),
      response: getSignResponse(sign),
    };

    setDetectedSigns((prev) => [...prev.slice(-9), newMessage]); // Keep last 10
    setCurrentResponse(newMessage.response);

    // Build conversation text
    const newText = `${sign}: ${newMessage.response}`;
    setConversationText((prev) => (prev ? `${prev}\n${newText}` : newText));

    // Auto-speak response if enabled
    if (autoSpeak) {
      setTimeout(() => {
        const speakButton = document.querySelector('[data-speak-button]') as HTMLButtonElement;
        speakButton?.click();
      }, 500);
    }
  };

  // ── Basic Sign-to-Response Mapping ──
  const getSignResponse = (sign: string): string => {
    const responses: Record<string, string> = {
      HELLO: 'Hello! Welcome to our learning platform. How can I help you today?',
      THANK_YOU: 'You are welcome! It is my pleasure to help you with your learning journey.',
      YES: 'Yes, I understand. Please continue with your question or request.',
      NO: 'I see. Could you please clarify what you would like instead?',
      QUESTION: 'That is a great question! Let me provide you with detailed information.',
      HELP: 'Of course! I am here to help you. What do you need assistance with?',
      PLEASE: 'I will be happy to assist you. Let me help right away.',
      SORRY: 'No worries! Mistakes happen. Let me help you with this.',
      LEARN: 'Excellent! I am ready to teach you. Let us begin this lesson together.',
    };

    return responses[sign] || `You signed: ${sign}. How can I assist you further?`;
  };

  // ── Export Conversation ──
  const exportConversation = () => {
    const data = {
      timestamp: new Date().toISOString(),
      signs: detectedSigns,
      fullConversation: conversationText,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sign-conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen soft-gradient-bg p-4 md:p-8 lg:p-12 overflow-hidden">
      {/* Background Static/Dynamic Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 glass-card rounded-full border-blue-100 mb-4">
            <span className="text-2xl">🤟</span>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-widest">
              Inclusive Hub
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Sign Language <span className="alia-gradient-text">Accessibility</span> Hub
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            A real-time, two-way communication bridge for Deaf and Hard of Hearing students, powered by AI.
          </p>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="glass-card hover-lift p-6 rounded-[24px] group">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">✅</div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Signs Detected</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{detectedSigns.length}</p>
          </div>

          <div className="glass-card hover-lift p-6 rounded-[24px] group">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">👁️</div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Current Sign</p>
            </div>
            <p className="text-4xl font-black text-slate-900 truncate">
              {currentResponse.split(':')[0] || 'Waiting...'}
            </p>
          </div>

          <div className="glass-card hover-lift p-6 rounded-[24px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🔊</div>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Auto-Speak</p>
              </div>
              <div
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${autoSpeak ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${autoSpeak ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 italic">
              {autoSpeak ? 'AI will read responses automatically' : 'Manual playback enabled'}
            </p>
          </div>
        </div>

        {/* Main Engines Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Vision Engine Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                VISION ENGINE
              </h3>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest">REAL-TIME HAND TRACKING</span>
            </div>
            <div className="glass-card rounded-[32px] overflow-hidden border-2 border-white/50 shadow-2xl h-[500px]">
              <SignInterpreter onSignDetected={handleSignDetected} />
            </div>
          </div>

          {/* Avatar Engine Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                AVATAR ENGINE
              </h3>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest">HAND GESTURE GENERATOR</span>
            </div>
            <div className="glass-card rounded-[32px] overflow-hidden border-2 border-white/50 shadow-2xl h-[500px] flex items-center justify-center bg-slate-950/5">
              <div className="transform scale-110">
                <SignAvatar textToSign={currentResponse.split(':')[0] || 'HELLO'} />
              </div>
            </div>
          </div>
        </div>

        {/* System Output & Conversation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Active Response */}
          <div className="md:col-span-12 lg:col-span-7 space-y-4">
            <h3 className="font-black text-slate-900 px-2 uppercase tracking-tight">📝 Computer Response</h3>
            <div className="glass-card rounded-[32px] p-8 border-2 border-white/80 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-[100px] -mr-10 -mt-10" />

              <div className="min-h-32 mb-8">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                  {currentResponse}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <ReadAloud text={currentResponse} className="flex-1" />
                <button
                  onClick={exportConversation}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover-lift flex items-center justify-center gap-3 shadow-xl"
                >
                  <span>💾</span>
                  Export Session
                </button>
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="md:col-span-12 lg:col-span-5 space-y-4">
            <h3 className="font-black text-slate-900 px-2 uppercase tracking-tight">📋 Recent Interactions</h3>
            <div className="glass-card rounded-[32px] p-6 border-2 border-white/80 shadow-2xl h-[340px] flex flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {detectedSigns.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <span className="text-5xl mb-4">🤟</span>
                    <p className="font-bold text-slate-900 italic">No activity yet</p>
                    <p className="text-xs">Start signing to the camera</p>
                  </div>
                ) : (
                  [...detectedSigns].reverse().map((msg) => (
                    <div key={msg.id} className="bg-white/50 rounded-2xl p-4 border border-white/50 shadow-sm animate-fade-in group hover:bg-white/80 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="text-blue-700 font-extrabold text-sm uppercase tracking-tighter">{msg.sign}</p>
                          </div>
                          <p className="text-slate-600 text-[13px] font-medium leading-relaxed">{msg.response}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Footer */}
        <div className="mt-20 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center md:text-left space-y-2 group">
              <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🧬</div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Tracking Engine</p>
              <p className="text-xs font-bold text-slate-900">MediaPipe Neural</p>
            </div>
            <div className="text-center md:text-left space-y-2 group">
              <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🧠</div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Interpretation</p>
              <p className="text-xs font-bold text-slate-900">Adaptive Transformer</p>
            </div>
            <div className="text-center md:text-left space-y-2 group">
              <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🪄</div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Visual Response</p>
              <p className="text-xs font-bold text-slate-900">Fabric.js Rendering</p>
            </div>
            <div className="text-center md:text-left space-y-2 group">
              <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">🎙️</div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Vocal Engine</p>
              <p className="text-xs font-bold text-slate-900">Web Speech Synthesis</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default SignLanguageAccessibilityHub;
