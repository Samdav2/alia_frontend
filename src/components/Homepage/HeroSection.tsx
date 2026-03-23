'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const HeroSection: React.FC = () => {
  const [isReading, setIsReading] = useState(false);

  const heroText =
    'Learning, Adapted to You. An intelligent, multi-agent platform designed to make education accessible, personalized, and inclusive for every student.';

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(heroText);
      utterance.rate = 0.9;
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-24 px-4 soft-gradient-bg">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Headline & Strategy */}
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 glass-card rounded-full border-blue-100">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ALIA 2026: The Future of Inclusive Learning
              </span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl xl:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Learning,<br />
                <span className="alia-gradient-text">Adapted</span> to You
              </h1>
              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Meet <span className="text-slate-900 font-bold border-b-2 border-blue-500/30">ALIA</span> — your personal adaptive learning agent. We’ve built a platform where accessibility isn’t a feature, it’s the heartbeat.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link
                href="/dashboard/student"
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover-lift shadow-2xl shadow-slate-200 text-center group"
              >
                Enter Learning Hub
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#features"
                className="px-10 py-5 glass-card rounded-2xl font-black text-lg hover-lift text-slate-900 text-center border-white/50"
              >
                Explore ALIA
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-12 pt-4 opacity-70">
              <div>
                <span className="block text-2xl font-black text-slate-900 italic tracking-tighter">ALIA</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Adaptive Hub</span>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                  +1k
                </div>
              </div>
            </div>
          </div>

          {/* Right: The ALIA Assist Demo Card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[40px] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />

            <div className="relative glass-card rounded-[32px] p-8 sm:p-10 border-white/80 shadow-2xl">
              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-white">
                    🤖
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-full border border-green-100">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Live Demo</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    Test the Reader Agent
                  </h3>
                  <p className="text-slate-600 font-medium">
                    ALIA can read any page content instantly. Click below to experience the accessible engine.
                  </p>
                </div>

                <button
                  onClick={handleReadAloud}
                  className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl hover-lift flex items-center justify-center gap-3 ${isReading
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                    }`}
                >
                  {isReading ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-6 bg-white/40 rounded-full animate-pulse" />
                        <div className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-6 bg-white/40 rounded-full animate-pulse [animation-delay:0.4s]" />
                      </div>
                      ALIA is Speaking...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">▶</span>
                      Play Audio Demo
                    </>
                  )}
                </button>

                <div className="p-5 bg-slate-900 rounded-2xl text-slate-300">
                  <div className="flex gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <code className="text-xs font-mono block leading-relaxed opacity-80">
                    // Agentic Mode: Enabled<br />
                    // Accessibility: WCAG 2.1 AAA<br />
                    // Target: Every Learner
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
