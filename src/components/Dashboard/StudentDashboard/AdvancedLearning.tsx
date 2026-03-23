'use client';

import React from 'react';
import Link from 'next/link';

export const AdvancedLearning: React.FC = () => {
  const advancedFeatures = [
    {
      icon: '🎯',
      title: 'Personalized Learning Paths',
      description: 'AI-powered curriculum adaptation based on your learning style, pace, and goals.',
      color: 'from-blue-500 to-cyan-500',
      features: ['Adaptive difficulty', 'Custom pacing', 'Goal tracking', 'Progress analytics']
    },
    {
      icon: '🧠',
      title: 'Neural Learning Analytics',
      description: 'Deep insights into your cognitive patterns, retention rates, and optimal study times.',
      color: 'from-purple-500 to-pink-500',
      features: ['Brain activity patterns', 'Memory retention', 'Focus analysis', 'Peak performance times']
    },
    {
      icon: '🤝',
      title: 'Collaborative Intelligence',
      description: 'Connect with study groups, peer tutors, and collaborative learning sessions.',
      color: 'from-green-500 to-emerald-500',
      features: ['Study groups', 'Peer matching', 'Group projects', 'Knowledge sharing']
    },
    {
      icon: '🎮',
      title: 'Gamified Learning',
      description: 'Earn badges, compete on leaderboards, and unlock achievements as you learn.',
      color: 'from-orange-500 to-red-500',
      features: ['Achievement badges', 'Leaderboards', 'Challenges', 'Rewards system']
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive data visualization of your learning journey and performance metrics.',
      color: 'from-indigo-500 to-blue-500',
      features: ['Performance graphs', 'Trend analysis', 'Predictive insights', 'Custom reports']
    },
    {
      icon: '🔬',
      title: 'Research & Projects',
      description: 'Access research databases, collaborate on projects, and publish your work.',
      color: 'from-teal-500 to-cyan-500',
      features: ['Research tools', 'Project management', 'Collaboration', 'Publishing platform']
    }
  ];

  const tools = [
    { icon: '📝', name: 'Smart Notes', description: 'AI-enhanced note-taking' },
    { icon: '🎤', name: 'Voice Recorder', description: 'Lecture transcription' },
    { icon: '📚', name: 'Digital Library', description: 'Unlimited resources' },
    { icon: '🧮', name: 'Study Calculator', description: 'Academic tools' },
    { icon: '📅', name: 'Smart Planner', description: 'Schedule optimization' },
    { icon: '💡', name: 'Idea Board', description: 'Brainstorming space' },
  ];

  return (
    <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student" className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
              <span>←</span> Dashboard
            </Link>
          </div>
          
          <div className="glass-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 border-white/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Premium Features</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Advanced <span className="text-blue-600">Learning</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-bold max-w-3xl">
                Unlock powerful AI-driven features designed to supercharge your learning experience and academic success.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Features Grid */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-8">
            Premium <span className="text-blue-600">Features</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {advancedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="glass-card rounded-[20px] sm:rounded-[32px] p-6 sm:p-8 border-white/60 hover-lift group"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4 sm:mb-6">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                
                <button className="mt-6 w-full px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all hover-lift">
                  Explore Feature
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Tools */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-8">
            Learning <span className="text-purple-600">Tools</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {tools.map((tool, idx) => (
              <button
                key={idx}
                className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/60 hover-lift group text-center"
              >
                <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1">
                  {tool.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 border-white/60">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 text-center">
            Your Learning <span className="text-green-600">Impact</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">2,450</div>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">Study Hours</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-purple-600 mb-2">87%</div>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">Avg. Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-green-600 mb-2">45</div>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">Achievements</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-orange-600 mb-2">12</div>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">Courses Done</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass-card rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 border-white/60 bg-gradient-to-br from-blue-50 to-purple-50 text-center">
          <div className="text-5xl sm:text-6xl mb-6">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-bold mb-8 max-w-2xl mx-auto">
            Upgrade to Premium and unlock all advanced features, unlimited AI assistance, and personalized learning paths.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-base hover:shadow-xl transition-all hover-lift">
              Upgrade to Premium
            </button>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black text-base hover:shadow-xl transition-all hover-lift border-2 border-slate-200">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
