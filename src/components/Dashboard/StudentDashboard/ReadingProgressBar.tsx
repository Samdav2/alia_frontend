'use client';

import React, { useState, useEffect } from 'react';
import { speechHighlightService } from '@/services/speechHighlightService';
import { textToSpeechService } from '@/services/textToSpeechService';

export const ReadingProgressBar: React.FC = () => {
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    const checkReadingStatus = () => {
      const highlighting = speechHighlightService.isActive();
      const speaking = textToSpeechService.isSpeaking();
      
      setIsReading(highlighting || speaking);
      
      if (highlighting) {
        const wordCount = speechHighlightService.getWordCount();
        setTotalWords(wordCount);
        
        // Calculate progress based on highlighted words
        const highlightedElements = document.querySelectorAll('[data-word-index].bg-yellow-300');
        if (highlightedElements.length > 0 && wordCount > 0) {
          const lastHighlighted = Array.from(highlightedElements).pop();
          if (lastHighlighted) {
            const wordIndex = parseInt(lastHighlighted.getAttribute('data-word-index') || '0');
            setProgress(Math.round((wordIndex / wordCount) * 100));
          }
        }
      } else {
        setProgress(0);
      }
    };

    const interval = setInterval(checkReadingStatus, 200);
    return () => clearInterval(interval);
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isReading) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    speechHighlightService.jumpToPercentage(percentage);
  };

  if (!isReading) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-full shadow-lg border border-yellow-200 p-2 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-slate-700">Reading</span>
        </div>
        
        <div 
          className="w-32 h-2 bg-slate-200 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
          title="Click to jump to position"
        >
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <span className="text-xs font-bold text-slate-500 min-w-[3rem]">
          {progress}%
        </span>
      </div>
    </div>
  );
};