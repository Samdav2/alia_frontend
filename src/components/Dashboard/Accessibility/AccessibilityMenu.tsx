'use client';

import React, { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPreferencesContext } from '@/context/UserPreferencesContext';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { SignNavigationToggle } from '@/components/Accessibility/SignNavigationToggle';

interface AccessibilityMenuProps {
  onClose: () => void;
  isChatPage?: boolean;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  onClose,
  isChatPage = false,
}) => {
  const context = useContext(UserPreferencesContext);
  const router = useRouter();
  const [showSignLanguageModal, setShowSignLanguageModal] = useState(false);

  if (!context) {
    return null;
  }

  const {
    bionicReading,
    setBionicReading,
    dyslexiaFont,
    setDyslexiaFont,
    highContrast,
    setHighContrast,
    voiceNavigation,
    setVoiceNavigation,
    isGazeScrollActive,
    setGazeScrollActive,
    isAutoPilotActive,
    setAutoPilotActive,
  } = context;

  const { isListening, transcript, lastCommand, isProcessingAI } = useVoiceNavigation(voiceNavigation || false);

  const handleOpenSignLanguageHub = () => {
    onClose();
    setTimeout(() => {
      router.push('/dashboard/sign-language');
    }, 300);
  };

  return (
    <div className={`fixed bottom-40 sm:bottom-36 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl p-4 sm:p-6 z-50 border-2 border-slate-200 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto ${isChatPage ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
      }`}>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Accessibility Options
        </h2>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 text-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 rounded"
          aria-label="Close accessibility menu"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Bionic Reading */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-xl">📖</span>
              Bionic Reading
            </label>
            <button
              onClick={() => setBionicReading(!bionicReading)}
              className={`w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 ${bionicReading ? 'bg-blue-500' : 'bg-slate-300'
                }`}
              aria-label={`Bionic reading ${bionicReading ? 'on' : 'off'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${bionicReading ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Bolds first half of words for faster reading
          </p>
        </div>

        {/* Dyslexia Font */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-xl">🔤</span>
              Dyslexia Font
            </label>
            <button
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className={`w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-green-300 ${dyslexiaFont ? 'bg-green-500' : 'bg-slate-300'
                }`}
              aria-label={`Dyslexia font ${dyslexiaFont ? 'on' : 'off'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${dyslexiaFont ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Uses OpenDyslexic font with wider spacing
          </p>
        </div>

        {/* High Contrast Mode */}
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <label className="block font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-xl">🎨</span>
            High Contrast
          </label>
          <div className="flex gap-2">
            {(['standard', 'dark', 'yellow'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHighContrast(mode)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-yellow-300 ${highContrast === mode
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Navigation */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-xl">🎤</span>
              Voice Navigation
            </label>
            <button
              onClick={() => setVoiceNavigation(!voiceNavigation)}
              className={`w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300 ${voiceNavigation ? 'bg-purple-500' : 'bg-slate-300'
                }`}
              aria-label={`Voice navigation ${voiceNavigation ? 'on' : 'off'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${voiceNavigation ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
          </div>
          {voiceNavigation && (
            <div className="mt-3 p-3 bg-white rounded-lg space-y-2">
              {/* Live status */}
              <p className="text-xs text-slate-600">
                {isListening ? (
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Listening…
                  </span>
                ) : (
                  <span className="text-amber-600">Microphone off</span>
                )}
              </p>
              {/* AI Processing status */}
              {isProcessingAI && (
                <p className="text-xs text-blue-600 font-bold animate-pulse flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  ALIA is thinking...
                </p>
              )}
              {/* Live transcript */}
              {transcript && (
                <p className="text-[11px] text-slate-500 italic truncate">
                  Heard: &quot;{transcript}&quot;
                </p>
              )}
              {/* Last executed command */}
              {lastCommand && (
                <p className="text-[11px] text-purple-600 font-semibold">
                  ✓ {lastCommand}
                </p>
              )}
              {/* Usage hint */}
              <details className="text-xs text-slate-600">
                <summary className="cursor-pointer font-semibold hover:text-slate-900">
                  How to use
                </summary>
                <div className="mt-2 space-y-1 pl-2 text-[11px]">
                  <p>Say <strong>&quot;Hey ALIA&quot;</strong> then a command:</p>
                  <p>• <em>go home</em></p>
                  <p>• <em>go to dashboard</em></p>
                  <p>• <em>scroll down / scroll up</em></p>
                  <p>• <em>read page</em></p>
                  <p>• <em>take quiz</em></p>
                  <p>• <em>help</em></p>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Gaze Scroll */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-xl">👁️</span>
              Gaze Scroll
            </label>
            <button
              onClick={() => setGazeScrollActive?.(!isGazeScrollActive)}
              className={`w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 ${isGazeScrollActive ? 'bg-indigo-500' : 'bg-slate-300'
                }`}
              aria-label={`Gaze scroll ${isGazeScrollActive ? 'on' : 'off'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${isGazeScrollActive ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Scroll by looking at top/bottom of screen
          </p>
        </div>

        {/* Neural Auto-Pilot */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-white flex items-center gap-2">
              <span className="text-xl animate-pulse">🤖</span>
              Neural Auto-Pilot
            </label>
            <button
              onClick={() => setAutoPilotActive?.(!isAutoPilotActive)}
              className={`w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-800 ${isAutoPilotActive ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              aria-label={`Neural auto-pilot ${isAutoPilotActive ? 'on' : 'off'}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${isAutoPilotActive ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {isAutoPilotActive ? 'AI IN CONTROL' : 'HANDS-FREE JOURNEY'}
          </p>
        </div>

        {/* Hand Sign Communication */}
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-300 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <label className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">🤟</span>
              Hand Sign Language
            </label>
          </div>
          <p className="text-xs text-slate-700 mb-3 leading-relaxed">
            Use hand gestures for communication. AI will recognize your signs and respond in kind.
          </p>
          <button
            onClick={handleOpenSignLanguageHub}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-bold hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-cyan-300 active:scale-95"
          >
            📹 Open Sign Language Hub
          </button>
        </div>

        {/* Global Hand Sign Navigation */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-400 shadow-md">
          <SignNavigationToggle />
        </div>
      </div>

      {/* Quick Access Modal (Show within menu) */}
      {showSignLanguageModal && (
        <div className="mt-4 p-4 bg-cyan-50 border-2 border-cyan-300 rounded-xl">
          <h4 className="font-bold text-slate-900 mb-2">🤟 Sign Language Hub</h4>
          <p className="text-xs text-slate-700 mb-3">
            Two-way sign language communication system with AI recognition and avatar response.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleOpenSignLanguageHub}
              className="w-full px-4 py-2.5 bg-cyan-500 text-white rounded-lg font-bold hover:bg-cyan-600 transition-all"
            >
              ✓ Open Full Hub Now
            </button>
            <button
              onClick={() => setShowSignLanguageModal(false)}
              className="w-full px-4 py-2.5 bg-slate-200 text-slate-900 rounded-lg font-bold hover:bg-slate-300 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}      <button
        onClick={onClose}
        className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-purple-300"
      >
        Close
      </button>
    </div>
  );
};
