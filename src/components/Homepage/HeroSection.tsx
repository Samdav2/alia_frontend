'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, Brain, Accessibility } from 'lucide-react';

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
      utterance.rate = 1.0;
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <section className="relative min-h-[110vh] flex items-center overflow-hidden pt-20 pb-24 px-4 bg-slate-50">
      {/* Premium Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Headline & Strategy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full border-blue-100/50 shadow-xl shadow-blue-500/5"
            >
              <div className="relative flex h-3 w-3">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></div>
              </div>
              <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent uppercase tracking-wider">
                ALIA V1: Evolution of Learning
              </span>
            </motion.div>

            <div className="space-y-8">
              <h1 className="text-4xl sm:text-7xl xl:text-9xl font-black text-slate-900 leading-[1.1] sm:leading-[1] tracking-[-0.04em] perspective-1000">
                Learning, <br />
                <span className="relative inline-block">
                  <span className="alia-gradient-text">Adapted</span>
                  <div className="absolute -bottom-2 inset-x-0 h-4 bg-blue-500/10 -z-10 rounded-full" />
                </span>
                <br /> to You
              </h1>
              <p className="text-lg sm:text-2xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Meet <span className="text-slate-900 font-black border-b-4 border-blue-500/20 px-1">ALIA</span> — your personal adaptive learning agent. We’ve built a platform where accessibility isn’t a feature, it’s the heartbeat.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <Link
                href="/dashboard/student"
                className="group px-8 sm:px-12 py-4 sm:py-6 bg-slate-900 text-white rounded-[16px] sm:rounded-[24px] font-black text-lg sm:text-xl hover-lift shadow-2xl shadow-slate-300 transition-all flex items-center justify-center gap-4"
              >
                Launch Hub
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </Link>
              <Link
                href="#importance"
                className="px-8 sm:px-12 py-4 sm:py-6 glass-card rounded-[16px] sm:rounded-[24px] font-black text-lg sm:text-xl hover-lift text-slate-900 border-white/80 flex items-center justify-center gap-3"
              >
                Why Project Matters
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-16 pt-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-blue-600 border border-slate-100">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-slate-900 tracking-tighter">AI-POWERED</span>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Autonomous Core</span>
                </div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg transition-transform hover:scale-110 cursor-pointer">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n + 20}`} alt="User" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs text-white font-black shadow-lg">
                  +1.2k
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: The ALIA Assist Demo Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[56px] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />

            <div className="relative glass-card rounded-[32px] md:rounded-[48px] p-6 md:p-10 lg:p-12 border-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] bg-white/80">
              <div className="space-y-6 md:space-y-10">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[20px] md:rounded-[28px] flex items-center justify-center text-3xl md:text-4xl shadow-2xl ring-8 ring-blue-50/50">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white animate-pulse" />
                  </div>
                  <div className="px-4 py-2 md:px-5 md:py-2.5 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em]">Engine Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Experience the <span className="text-blue-600">Audio Hub</span>
                  </h3>
                  <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                    ALIA's voice core uses advanced neural sythesis to make every word accessible. Listen to the demo.
                  </p>
                </div>

                <button
                  onClick={handleReadAloud}
                  className={`w-full py-6 rounded-[24px] font-black text-2xl transition-all shadow-xl hover:shadow-2xl hover-lift flex items-center justify-center gap-4 ${isReading
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white'
                    }`}
                >
                  {isReading ? (
                    <>
                      <div className="flex items-end gap-1.5 h-8">
                        {[0, 1, 2, 3, 4].map(i => (
                          <motion.div
                            key={i}
                            animate={{ height: [12, 32, 16, 28, 12] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1.5 bg-blue-400 rounded-full"
                          />
                        ))}
                      </div>
                      ALIA Speaking
                    </>
                  ) : (
                    <>
                      <Play className="w-8 h-8 fill-current" />
                      Play Voice Demo
                    </>
                  )}
                </button>

                <div className="p-8 bg-slate-900 rounded-[32px] text-slate-300 relative overflow-hidden group/console">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover/console:bg-blue-500/30 transition-colors" />
                  <div className="flex gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-2 font-mono text-sm leading-relaxed text-blue-300/80">
                    <p><span className="text-slate-500">{'>'}</span> Initialising ALIA_CORE...</p>
                    <p><span className="text-slate-500">{'>'}</span> Audio Layer: <span className="text-emerald-400">READY</span></p>
                    <p><span className="text-slate-500">{'>'}</span> Accessibility: <span className="text-indigo-400 font-bold uppercase tracking-tighter italic">"Limitless"</span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
