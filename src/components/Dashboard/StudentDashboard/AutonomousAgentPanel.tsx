'use client';

import React from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useAutoPilot } from '@/hooks/useAutoPilot';
import { COURSES } from '@/data/courseData';
import { autonomousAgentService } from '@/services/autonomousAgentService';
import { VoiceSettingsPanel } from './VoiceSettingsPanel';

export const AutonomousAgentPanel: React.FC = () => {
  const { isAutoPilotActive, setAutoPilotActive } = useUserPreferences();
  const { status, progress, coursesCompleted, resetProgress } = useAutoPilot();
  
  const agentState = autonomousAgentService.getState();
  const currentCourse = agentState.currentCourse ? COURSES[agentState.currentCourse] : null;
  const [voiceEnabled, setVoiceEnabled] = React.useState(autonomousAgentService.getVoiceEnabled());
  const [showVoiceSettings, setShowVoiceSettings] = React.useState(false);

  const handleToggle = () => {
    setAutoPilotActive?.(!isAutoPilotActive);
  };

  const handleVoiceToggle = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    autonomousAgentService.setVoiceEnabled(newVoiceState);
  };

  return (
    <div className="glass-card rounded-[24px] sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-purple-100 shadow-2xl shadow-purple-500/10 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg transition-all ${
            isAutoPilotActive 
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 animate-pulse' 
              : 'bg-slate-200'
          }`}>
            🤖
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Autonomous Agent
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-bold">
              {isAutoPilotActive ? 'Active' : 'Standby'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Voice Settings */}
          <button
            onClick={() => setShowVoiceSettings(true)}
            className="p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all hover-lift"
            title="Voice settings"
          >
            ⚙️
          </button>

          {/* Voice Toggle */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2 sm:p-3 rounded-xl font-black text-sm transition-all hover-lift ${
              voiceEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
            title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>

          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all hover-lift ${
              isAutoPilotActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl'
            }`}
          >
            {isAutoPilotActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Voice Settings Panel */}
      <VoiceSettingsPanel 
        isOpen={showVoiceSettings} 
        onClose={() => setShowVoiceSettings(false)} 
      />

      {/* Status Display */}
      {isAutoPilotActive && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in">
          {/* Current Course Info */}
          {currentCourse && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200">
              <p className="text-xs sm:text-sm font-black text-purple-600 uppercase tracking-widest mb-2">
                Current Course
              </p>
              <p className="text-base sm:text-lg font-black text-slate-900">
                {currentCourse.code} - {currentCourse.title}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Instructor: {currentCourse.instructor}
              </p>
            </div>
          )}

          {/* Status Message */}
          <div className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/80">
            <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
              Status
            </p>
            <p className="text-sm sm:text-lg font-bold text-slate-700">
              {status || 'Initializing...'}
            </p>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">
                  Progress
                </p>
                <p className="text-xs sm:text-sm font-black text-purple-600">
                  {progress}%
                </p>
              </div>
              <div className="h-2 sm:h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Courses Completed */}
          {coursesCompleted.length > 0 && (
            <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200">
              <p className="text-xs sm:text-sm font-black text-green-600 uppercase tracking-widest mb-3">
                Courses Completed
              </p>
              <div className="flex gap-2 flex-wrap">
                {coursesCompleted.map((courseId) => {
                  const course = COURSES[courseId];
                  return (
                    <span
                      key={courseId}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-bold"
                      title={course ? `${course.code} - ${course.title}` : `Course ${courseId}`}
                    >
                      {course ? course.code : `Course ${courseId}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      {!isAutoPilotActive && (
        <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 space-y-3">
          <p className="text-xs sm:text-sm font-black text-blue-600 uppercase tracking-widest">
            How it works
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Automatically selects untaken courses</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Follows actual topic durations (15-30 min)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Reads content aloud with voice announcements</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Announces module and course transitions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span>Fully accessible for all users</span>
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-xs font-bold text-green-700">
              🔊 Voice Mode: {voiceEnabled ? 'Enabled' : 'Disabled'} - Click the speaker icon to toggle
            </p>
          </div>
        </div>
      )}

      {/* Debug: Reset Progress */}
      {!isAutoPilotActive && (
        <div className="space-y-2">
          <button
            onClick={resetProgress}
            className="w-full px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Reset All Progress (Debug)
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            {['1', '2', '3', '4'].map((courseId) => (
              <button
                key={courseId}
                onClick={() => {
                  if (confirm(`Reset Course ${courseId} progress?`)) {
                    autonomousAgentService.resetCourseProgress(courseId);
                  }
                }}
                className="px-2 py-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors border border-orange-200 rounded"
              >
                Reset Course {courseId}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
