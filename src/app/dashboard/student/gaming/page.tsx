'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function EducationalGamingPage() {
  const [showGame, setShowGame] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_EDUGAME_URL || 'https://wordchain-gamma.vercel.app/';
  }, []);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, []);

  const startEmbedAttempt = () => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }

    setShowGame(true);
    setIsIframeLoaded(false);
    setIsIframeBlocked(false);

    loadTimerRef.current = setTimeout(() => {
      setIsIframeBlocked(true);
    }, 6000);
  };

  const closeEmbed = () => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    setShowGame(false);
  };

  const handleIframeLoaded = () => {
    setIsIframeLoaded(true);
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen soft-gradient-bg pt-6 sm:pt-10 px-4 sm:px-6 lg:px-10 pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass-card rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-slate-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <p className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest">Student Gaming Lab</p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Educational Gaming</h1>
              <p className="text-slate-600 font-medium text-sm sm:text-base max-w-2xl">
                Practice vocabulary and logic skills through interactive gameplay. Click access to launch the game directly inside ALIA.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={startEmbedAttempt}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors"
              >
                Access Game (Iframe)
              </button>
              <a
                href={gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-colors text-center"
              >
                Open New Tab
              </a>
            </div>
          </div>
        </div>

        {showGame ? (
          <div className="glass-card rounded-3xl sm:rounded-4xl p-4 sm:p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">WordChain Game</h2>
              <button
                onClick={closeEmbed}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
              >
                Close Game
              </button>
            </div>

            <div className="w-full h-[70vh] rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <iframe
                src={gameUrl}
                title="Educational Gaming"
                className="w-full h-full"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={handleIframeLoaded}
              />
            </div>

            {!isIframeLoaded && !isIframeBlocked && (
              <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">
                Loading game inside iframe...
              </p>
            )}

            {isIframeBlocked && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-amber-800 font-bold">
                  This website blocks iframe embedding (security policy). Use <span className="font-black">Open New Tab</span> to play.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 border border-slate-200 text-center">
            <div className="text-5xl mb-3">🎮</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Ready to Play?</h3>
            <p className="text-slate-600 font-medium">Press <span className="font-black">Access Game</span> to launch the educational game in an embedded frame.</p>
          </div>
        )}
      </div>
    </div>
  );
}
