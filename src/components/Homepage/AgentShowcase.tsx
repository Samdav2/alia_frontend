'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Accessibility, CheckCircle, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  gradient: string;
  visual: string;
}

const AGENTS: Agent[] = [
  {
    id: 'content',
    name: 'Content Agent',
    icon: '📄',
    description:
      'Transforms complex course materials into digestible, structured content that adapts to your learning style.',
    features: [
      'Automatic summarization of lengthy documents',
      'Bullet-point extraction for quick review',
      'Key concept highlighting and emphasis',
      'Multi-format support (PDF, video, text)',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    visual: '📊',
  },
  {
    id: 'accessibility',
    name: 'Accessibility Agent',
    icon: '♿',
    description:
      'Ensures every student can learn in their preferred way with adaptive interfaces and assistive technologies.',
    features: [
      'Natural text-to-speech synthesis',
      'Dyslexia-friendly font rendering',
      'Multiple high contrast modes',
      'Voice navigation and commands',
    ],
    gradient: 'from-purple-500 to-pink-500',
    visual: '🎙️',
  },
  {
    id: 'assessment',
    name: 'Assessment Agent',
    icon: '✅',
    description:
      'Creates adaptive quizzes that intelligently adjust difficulty based on your performance and learning pace.',
    features: [
      'Dynamic difficulty adjustment',
      'Instant feedback and explanations',
      'Personalized hints when stuck',
      'Comprehensive progress tracking',
    ],
    gradient: 'from-green-500 to-emerald-500',
    visual: '📈',
  },
];

export const AgentShowcase: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string>('content');
  const active = AGENTS.find((a) => a.id === activeAgent) || AGENTS[0];

  return (
    <section id="features" className="py-24 sm:py-32 px-4 bg-slate-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-full mb-8 border-blue-100"
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-black bg-blue-600 bg-clip-text text-transparent uppercase tracking-[0.2em]">The Core Engine</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black text-slate-900 mb-8 tracking-tight"
          >
            The <span className="alia-gradient-text">Engine Room</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-slate-600 max-w-2xl mx-auto font-medium"
          >
            Discover the intelligent, multi-agent system that powers every interaction within the ALIA ecosystem.
          </motion.p>
        </div>

        {/* Agent Tabs - God Level Tabs */}
        <div className="flex flex-wrap gap-6 mb-20 justify-center">
          {AGENTS.map((agent) => (
            <motion.button
              key={agent.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveAgent(agent.id)}
              className={`relative px-10 py-6 rounded-3xl font-black transition-all flex items-center gap-4 overflow-hidden shadow-2xl ${activeAgent === agent.id
                ? `text-white shadow-blue-500/20`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500/50'
                }`}
            >
              <AnimatePresence>
                {activeAgent === agent.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-900 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              <span className="text-3xl">{agent.icon}</span>
              <span className="text-xl">{agent.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Agent Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAgent}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-[56px] p-10 lg:p-20 border-white shadow-[0_48px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative group bg-white/90"
          >
            {/* Background Blob */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${active.gradient} opacity-10 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:opacity-20 transition-opacity duration-1000`} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              {/* Left: Visual Representation */}
              <div className="relative flex justify-center order-2 lg:order-1">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className={`w-full max-w-sm aspect-square bg-gradient-to-br ${active.gradient} rounded-[64px] flex items-center justify-center shadow-[0_48px_96px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden`}
                >
                  <div className="text-[160px] relative z-10 drop-shadow-2xl">{active.visual}</div>

                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                  }} />
                </motion.div>

                {/* Floating Meta Badges */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute -top-10 -right-4 px-8 py-4 glass-card rounded-2xl shadow-2xl border-white"
                >
                  <span className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    Neural Sync
                  </span>
                </motion.div>
                <div className="absolute -bottom-10 -left-10 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl">
                  <span className="text-lg font-black tracking-wider flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Agentic v4.0
                  </span>
                </div>
              </div>

              {/* Right: Content Analysis */}
              <div className="space-y-12 order-1 lg:order-2">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${active.gradient} text-white flex items-center justify-center text-4xl shadow-xl ring-8 ring-blue-50/50`}>
                      {active.id === 'content' ? <FileText className="w-10 h-10" /> :
                        active.id === 'accessibility' ? <Accessibility className="w-10 h-10" /> :
                          <CheckCircle className="w-10 h-10" />}
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {active.name}
                    </h3>
                  </div>
                  <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                    {active.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm uppercase font-black text-slate-400 tracking-[0.3em]">
                    Key Capabilities
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    {active.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 10 }}
                        className="flex items-center gap-6 glass-card p-6 rounded-3xl border-slate-100 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${active.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <ChevronRight className="w-6 h-6" />
                        </div>
                        <span className="text-slate-800 font-black text-lg">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <button className={`w-full lg:w-auto px-12 py-6 bg-slate-900 text-white rounded-3xl font-black text-xl hover-lift shadow-2xl transition-all flex items-center justify-center gap-4`}>
                  Deep Dive Engine
                  <ArrowUpRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
