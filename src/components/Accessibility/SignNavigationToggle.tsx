'use client';

import React, { useState } from 'react';
import { useGlobalSignNavigation } from '@/context/SignNavigationContext';
import { CameraPreviewModal } from './CameraPreviewModal';
import { AnimatedGestureGuide } from './AnimatedGestureGuide';

/**
 * Global Sign Navigation Toggle Button
 *
 * Appears in accessibility FAB - turns on/off hand sign navigation
 * Works everywhere on the platform, just like WebGazer
 *
 * Includes:
 * - Toggle button to enable/disable
 * - Live camera preview modal
 * - Detailed hand gesture instructions with animations
 */
export const SignNavigationToggle: React.FC = () => {
  const { isEnabled, toggleSignNavigation, lastDetectedSign, commandsExecuted } = useGlobalSignNavigation();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {/* Toggle Button */}
      <button
        onClick={toggleSignNavigation}
        className={`w-full px-4 py-3 rounded-lg font-bold transition-all flex items-center gap-2 justify-center ${
          isEnabled
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
            : 'bg-slate-600 hover:bg-slate-700 text-white'
        }`}
        title={isEnabled ? 'Disable hand sign navigation' : 'Enable hand sign navigation globally'}
      >
        <span className="text-lg">🤟</span>
        {isEnabled ? 'Sign Navigation ON' : 'Sign Navigation OFF'}
      </button>

      {/* Status Info */}
      {isEnabled && (
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-2">
          <p className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            <span>Available on every page</span>
          </p>
          {lastDetectedSign && (
            <p className="flex items-center gap-2">
              <span>Last sign:</span>
              <span className="font-bold text-blue-300">{lastDetectedSign}</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <span>Commands:</span>
            <span className="font-bold text-green-300">{commandsExecuted}</span>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            💡 Like WebGazer - once enabled, navigate with your hands anywhere!
          </p>

          {/* Camera Preview Button */}
          <button
            onClick={() => setShowCamera(true)}
            className="w-full mt-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 justify-center"
          >
            <span>📹</span>
            View Hand Movements
          </button>
        </div>
      )}

      {/* Info Text */}
      <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-400 border border-slate-700">
        <p className="font-bold text-slate-300 mb-1">Available Signs:</p>
        <ul className="space-y-0.5 text-slate-500">
          <li>🤷 SCROLL_UP / SCROLL_DOWN</li>
          <li>🔙 GO_BACK / DASHBOARD</li>
          <li>🎓 ATTEND_CLASS (clicks buttons)</li>
          <li>🎬 PLAY_VIDEO / STOP_VIDEO</li>
          <li>🆘 ASK_FOR_HELP</li>
        </ul>
      </div>

      {/* Gesture Instructions Toggle */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition-all"
      >
        {showInstructions ? '▼ Hide' : '▶ Show'} Animated Gesture Guide
      </button>

      {/* Animated Gesture Instructions */}
      {showInstructions && (
        <div className="bg-slate-950 rounded-lg p-4 border border-slate-700 space-y-3">
          <AnimatedGestureGuide />
        </div>
      )}

      {/* Camera Preview Modal */}
      <CameraPreviewModal isVisible={showCamera} onClose={() => setShowCamera(false)} />
    </div>
  );
};
