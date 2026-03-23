'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { COURSES, getCourseTopics } from '@/data/courseData';

interface LearningMetrics {
  totalTimeSpent: number; // in minutes
  coursesCompleted: number;
  topicsCompleted: number;
  averageScore: number;
  learningStreak: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedActions: string[];
  accessibilityUsage: {
    voiceNavigation: number;
    bionicReading: number;
    highContrast: number;
    dyslexiaFont: number;
  };
}

export const AdvancedMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis of learning data
    const analyzeProgress = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 2000));
      
      // Load progress from localStorage
      const savedProgress = localStorage.getItem('course-progress');
      let progressData: Record<string, any> = {};
      
      if (savedProgress) {
        try {
          progressData = JSON.parse(savedProgress);
        } catch (e) {
          console.error('Failed to load progress', e);
        }
      }

      // Calculate metrics
      const coursesCompleted = Object.values(progressData).filter((p: any) => p.isCompleted).length;
      const totalTopicsCompleted = Object.values(progressData).reduce((sum: number, p: any) => 
        sum + (p.topicsCompleted?.length || 0), 0
      );
      
      // Mock AI-generated insights
      const mockMetrics: LearningMetrics = {
        totalTimeSpent: totalTopicsCompleted * 25 + Math.floor(Math.random() * 120),
        coursesCompleted,
        topicsCompleted: totalTopicsCompleted,
        averageScore: 85 + Math.floor(Math.random() * 10),
        learningStreak: Math.floor(Math.random() * 15) + 1,
        weakAreas: [
          'Multi-agent coordination protocols',
          'Advanced system architecture',
          'Performance optimization'
        ],
        strongAreas: [
          'Basic agent concepts',
          'System integration',
          'Problem-solving approach'
        ],
        recommendedActions: [
          'Focus more time on coordination protocols',
          'Practice with real-world case studies',
          'Review advanced architecture patterns',
          'Take breaks every 25 minutes for better retention'
        ],
        accessibilityUsage: {
          voiceNavigation: Math.floor(Math.random() * 50),
          bionicReading: Math.floor(Math.random() * 30),
          highContrast: Math.floor(Math.random() * 20),
          dyslexiaFont: Math.floor(Math.random() * 15),
        }
      };

      setMetrics(mockMetrics);
      setLoading(false);
    };

    analyzeProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen soft-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-bold text-slate-700">AI is analyzing your learning data...</p>
          <p className="text-sm text-slate-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-12 px-4 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/student" className="text-blue-600 font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2 mb-4">
              <span>←</span> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Advanced <span className="alia-gradient-text">Metrics</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2">AI-powered learning analytics and insights</p>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-600">{metrics.averageScore}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-3xl p-6 border-green-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                📚
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{metrics.coursesCompleted}</div>
                <div className="text-sm font-bold text-slate-500">Courses Completed</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                ✅
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{metrics.topicsCompleted}</div>
                <div className="text-sm font-bold text-slate-500">Topics Mastered</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-purple-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⏱️
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{metrics.totalTimeSpent}m</div>
                <div className="text-sm font-bold text-slate-500">Time Invested</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-orange-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                🔥
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{metrics.learningStreak}</div>
                <div className="text-sm font-bold text-slate-500">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="glass-card rounded-3xl p-8 border-green-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                💪
              </div>
              <h3 className="text-2xl font-black text-slate-900">Your Strengths</h3>
            </div>
            <div className="space-y-3">
              {metrics.strongAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-green-600 font-black">✓</span>
                  <span className="font-bold text-slate-700">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="glass-card rounded-3xl p-8 border-orange-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                🎯
              </div>
              <h3 className="text-2xl font-black text-slate-900">Focus Areas</h3>
            </div>
            <div className="space-y-3">
              {metrics.weakAreas.map((area, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <span className="text-orange-600 font-black">⚡</span>
                  <span className="font-bold text-slate-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card rounded-3xl p-8 border-blue-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              🤖
            </div>
            <h3 className="text-2xl font-black text-slate-900">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.recommendedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <span className="text-blue-600 font-black text-lg">{idx + 1}.</span>
                <span className="font-bold text-slate-700">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Usage */}
        <div className="glass-card rounded-3xl p-8 border-purple-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
              ♿
            </div>
            <h3 className="text-2xl font-black text-slate-900">Accessibility Features Usage</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-black text-purple-600">{metrics.accessibilityUsage.voiceNavigation}%</div>
              <div className="text-sm font-bold text-slate-600">Voice Navigation</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-black text-purple-600">{metrics.accessibilityUsage.bionicReading}%</div>
              <div className="text-sm font-bold text-slate-600">Bionic Reading</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-black text-purple-600">{metrics.accessibilityUsage.highContrast}%</div>
              <div className="text-sm font-bold text-slate-600">High Contrast</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-black text-purple-600">{metrics.accessibilityUsage.dyslexiaFont}%</div>
              <div className="text-sm font-bold text-slate-600">Dyslexia Font</div>
            </div>
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div className="glass-card rounded-3xl p-8 border-slate-100">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Learning Progress Over Time</h3>
          <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="font-bold">Interactive charts coming soon</p>
              <p className="text-sm">AI-powered progress visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};