'use client';

import React from 'react';

interface TextToSpeechButtonProps {
  text: string;
  isActive: boolean;
  onChange: (isActive: boolean) => void;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  isActive,
  onChange,
}) => {
  const handleToggle = () => {
    if (isActive) {
      // Stop speech
      window.speechSynthesis.cancel();
      onChange(false);
    } else {
      // Start speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => onChange(false);
      window.speechSynthesis.speak(utterance);
      onChange(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
      title="Read this content aloud"
    >
      <span className="text-lg">{isActive ? '⏸' : '🔊'}</span>
      {isActive ? 'Stop Reading' : 'Read to Me'}
    </button>
  );
};
