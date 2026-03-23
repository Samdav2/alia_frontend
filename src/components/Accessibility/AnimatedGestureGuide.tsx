'use client';

import React, { useState } from 'react';
import './AnimatedGestureGuide.css';

/**
 * Animated Gesture Guide Component
 *
 * Shows each hand gesture with:
 * - Animated emoji showing the action
 * - Step-by-step instructions
 * - Visual motion indicators
 * - Tips and common mistakes
 */

export const AnimatedGestureGuide: React.FC = () => {
  const [activeGesture, setActiveGesture] = useState<string | null>(null);

  const gestures = [
    {
      id: 'scroll-up',
      name: 'SCROLL_UP',
      emoji: '☝️',
      animation: 'point-up-anim',
      description: 'Navigate up through content',
      action: '☝️ (Point Up)',
      steps: [
        'Fold all fingers into a fist',
        'Extend ONLY your index finger',
        'Point straight up at the camera',
        'Keep other fingers tightly folded',
      ],
      tips: 'ONLY the index finger should be up!',
    },
    {
      id: 'scroll-down',
      name: 'SCROLL_DOWN',
      emoji: '✌️',
      animation: 'peace-sign-anim',
      description: 'Navigate down through content',
      action: '✌️ (Peace Sign)',
      steps: [
        'Fold your thumb, ring, and pinky',
        'Extend Index and Middle fingers',
        'Form a clear V-shape (Peace Sign)',
        'Keep hand steady facing camera',
      ],
      tips: 'Ensure ONLY index and middle fingers are up',
    },
    {
      id: 'go-back',
      name: 'GO_BACK',
      emoji: '🤟',
      animation: 'three-fingers-anim',
      description: 'Go to previous page',
      action: '🤟 (Three Fingers)',
      steps: [
        'Extend Index, Middle, and Ring fingers',
        'Keep your Pinky and Thumb folded',
        'Show three clear fingers to camera',
        'Hold steady for detection',
      ],
      tips: 'Index, Middle, and Ring must all be up',
    },
    {
      id: 'ask-help',
      name: 'ASK_FOR_HELP',
      emoji: '✋',
      animation: 'open-hand-anim',
      description: 'Open help/support',
      action: '✋ (Open Hand)',
      steps: [
        'Extend all four fingers wide',
        'Keep thumb away from index finger',
        'Show full open palm to camera',
        'Do not pinch any fingers',
      ],
      tips: 'Spread fingers wide for best detection',
    },
    {
      id: 'stop-video',
      name: 'STOP_VIDEO',
      emoji: '✊',
      animation: 'closed-fist-anim',
      description: 'Stop/pause videos',
      action: '✊ (Closed Fist)',
      steps: [
        'Fold all fingers tightly into a fist',
        'Wrap your thumb over your fingers',
        'Show the back or front of your fist',
        'Ensure no fingers are sticking out',
      ],
      tips: 'A tight fist is mathematically distinct from all others!',
    },
    {
      id: 'dashboard',
      name: 'DASHBOARD',
      emoji: '🤘',
      animation: 'rock-on-anim',
      description: 'Go to dashboard',
      action: '🤘 (Rock On)',
      steps: [
        'Extend your Index and Pinky fingers',
        'Fold Middle and Ring fingers down',
        'Show the "Rock On" sign clearly',
        'Maintain a steady pose',
      ],
      tips: 'Middle and Ring fingers MUST be folded',
    },
    {
      id: 'attend-class',
      name: 'ATTEND_CLASS',
      emoji: '👌',
      animation: 'ok-sign-anim',
      description: 'Attend/Primary Action',
      action: '👌 (OK Sign)',
      steps: [
        'Touch Thumb tip to Index finger tip',
        'Extend Middle, Ring, and Pinky up',
        'Form a circular "OK" sign',
        'Hold the pinch clearly for AI',
      ],
      tips: 'Touch thumb and index tips to form a circle',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {gestures.map((gesture) => (
          <button
            key={gesture.id}
            onClick={() => setActiveGesture(activeGesture === gesture.id ? null : gesture.id)}
            className={`p-3 rounded-lg transition-all transform hover:scale-105 ${activeGesture === gesture.id
              ? 'bg-emerald-600 border-2 border-emerald-400 shadow-lg'
              : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
              }`}
          >
            <p className="text-2xl mb-1 text-center animate-bounce">{gesture.emoji}</p>
            <p className="text-xs font-bold text-white text-center truncate">{gesture.name}</p>
          </button>
        ))}
      </div>

      {/* Selected Gesture Detail */}
      {activeGesture && (
        <div className="bg-slate-900 rounded-lg border-2 border-emerald-500 p-6 space-y-4">
          {gestures
            .filter((g) => g.id === activeGesture)
            .map((gesture) => (
              <div key={gesture.id} className="space-y-4">
                {/* Title & Action */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{gesture.name}</h3>
                  <p className="text-emerald-300 text-lg font-bold">{gesture.description}</p>
                </div>

                {/* Animated Gesture */}
                <div className="flex justify-center py-4 bg-slate-800 rounded-lg">
                  <div className={`text-6xl ${gesture.animation}`}>
                    {gesture.emoji}
                  </div>
                </div>

                {/* Action Description */}
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 text-center">
                  <p className="text-emerald-300 font-bold text-lg">{gesture.action}</p>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  <p className="font-bold text-white text-lg">Steps:</p>
                  <div className="space-y-2">
                    {gesture.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                        </div>
                        <p className="text-slate-300 pt-1 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-300 font-bold mb-1">💡 Tip:</p>
                  <p className="text-slate-300 text-sm">{gesture.tips}</p>
                </div>

                {/* Timing */}
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <p className="font-bold text-white text-sm mb-2">⏱️ Timing:</p>
                  <p className="text-slate-400 text-sm">
                    Hold gesture for <strong className="text-emerald-300">0.5-1 second</strong> after reaching final position
                  </p>
                </div>
              </div>
            ))}

          {/* Close Button */}
          <button
            onClick={() => setActiveGesture(null)}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
