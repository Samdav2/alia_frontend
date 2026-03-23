'use client';

import React, { useEffect, useState } from 'react';

interface SignAvatarProps {
  textToSign: string;
}

const SignAvatar: React.FC<SignAvatarProps> = ({ textToSign }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger a visual animation whenever the computer responds with a new sign
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1500); // Animation lasts 1.5s
    return () => clearTimeout(timer);
  }, [textToSign]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-6">
      {/* Digital Interpreter Avatar UI */}
      <div className={`relative flex items-center justify-center w-56 h-56 rounded-full border-4 transition-all duration-700 shadow-2xl ${isAnimating
          ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 scale-105'
          : 'border-slate-200 bg-white/50 backdrop-blur-md scale-100'
        }`}>

        {/* Animated Rings when Signing */}
        {isAnimating && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-20" />
            <div className="absolute -inset-6 rounded-full border-2 border-purple-400 animate-pulse opacity-30" />
            <div className="absolute -inset-12 rounded-full border border-blue-300 animate-blob opacity-10" />
          </>
        )}

        {/* Hand Icon */}
        <div className={`text-8xl transition-all duration-500 filter drop-shadow-xl ${isAnimating ? 'scale-110 rotate-12' : 'scale-90 grayscale-[0.5]'}`}>
          {isAnimating ? '🤟' : '✋'}
        </div>

        {/* Connection Pulse */}
        <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg animate-pulse" />
      </div>

      {/* Status Output */}
      <div className="mt-12 text-center space-y-3">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
          {isAnimating ? 'AI INTERPRETER ACTIVE' : 'SYSTEM STANDBY'}
        </p>
        <div className="glass-card px-8 py-4 rounded-2xl border-white/80 shadow-xl inline-block transform transition-all group-hover:scale-110">
          <p className="text-3xl font-black alia-gradient-text">{textToSign}</p>
        </div>
      </div>
    </div>
  );
};

export default SignAvatar;
