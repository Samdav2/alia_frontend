'use client';

import React, { useState } from 'react';

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
    <section id="features" className="py-24 sm:py-32 px-4 soft-gradient-bg relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-6 border-blue-100">
            <span className="text-sm font-bold bg-blue-600 bg-clip-text text-transparent uppercase tracking-widest">The Core Engine</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            The <span className="alia-gradient-text">Engine Room</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
            Discover the intelligent, multi-agent system that powers every interaction within the ALIA ecosystem.
          </p>
        </div>

        {/* Agent Tabs */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`px-8 py-4 rounded-2xl font-black transition-all hover-lift active:scale-95 shadow-lg ${activeAgent === agent.id
                ? `bg-slate-900 text-white shadow-2xl`
                : 'bg-white/80 text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-600'
                }`}
            >
              <span className="mr-3 text-2xl">{agent.icon}</span>
              {agent.name}
            </button>
          ))}
        </div>

        {/* Agent Details */}
        <div className="glass-card rounded-[40px] p-8 lg:p-16 border-white/80 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual Representation */}
            <div className="relative flex justify-center order-2 lg:order-1">
              <div className={`w-full max-w-sm aspect-square bg-gradient-to-br ${active.gradient} rounded-[48px] flex items-center justify-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden`}>
                <div className="text-[120px] animate-float relative z-10">{active.visual}</div>

                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }} />
              </div>

              {/* Floating Meta Badges */}
              <div className="absolute -top-6 -right-6 px-6 py-3 glass-card rounded-2xl shadow-xl animate-float">
                <span className="text-sm font-black text-slate-900">Neural Sync</span>
              </div>
              <div className="absolute -bottom-6 -left-6 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl animate-float animation-delay-2000">
                <span className="text-sm font-black">Agentic v4.0</span>
              </div>
            </div>

            {/* Right: Content Analysis */}
            <div className="space-y-10 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${active.gradient} text-white flex items-center justify-center text-2xl shadow-lg ring-4 ring-white`}>
                    {active.icon}
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {active.name}
                  </h3>
                </div>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  {active.description}
                </p>
              </div>

              <div className="space-y-5">
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-[0.2em]">
                  Key Capabilities
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {active.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 glass-card p-4 rounded-2xl border-white/40 hover:border-blue-500/30 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${active.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-800 font-bold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className={`w-full lg:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover-lift shadow-2xl shadow-slate-200`}>
                Deep Dive into {active.name} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
