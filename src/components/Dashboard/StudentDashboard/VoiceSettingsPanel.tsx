'use client';

import React, { useState, useEffect } from 'react';
import { textToSpeechService, VoiceLanguage, VoiceGender } from '@/services/textToSpeechService';

interface VoiceSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsPanel: React.FC<VoiceSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState(textToSpeechService.getVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = textToSpeechService.getAvailableVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    textToSpeechService.setVoiceSettings(newSettings);
  };

  const testVoice = () => {
    const testText = settings.language === 'en-US' 
      ? 'Hello! This is how I sound with your current voice settings.'
      : 'Ndewo! This is a test of the selected voice settings.';
    
    textToSpeechService.announce(testText);
  };

  const languages: { code: VoiceLanguage; name: string; flag: string }[] = [
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬' },
    { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬' },
    { code: 'yo-NG', name: 'Yoruba', flag: '🇳🇬' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">Voice Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider">
              Language
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSettingChange('language', lang.code)}
                  className={`p-2 sm:p-3 rounded-xl border-2 transition-all text-left ${
                    settings.language === lang.code
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{lang.flag}</span>
                    <span className="font-bold text-xs sm:text-sm">{lang.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider">
              Voice Gender
            </label>
            <div className="flex gap-2">
              {(['female', 'male'] as VoiceGender[]).map((gender) => (
                <button
                  key={gender}
                  onClick={() => handleSettingChange('gender', gender)}
                  className={`flex-1 p-2 sm:p-3 rounded-xl border-2 transition-all ${
                    settings.gender === gender
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base sm:text-lg mb-1">
                      {gender === 'female' ? '👩' : '👨'}
                    </div>
                    <div className="font-bold text-xs sm:text-sm capitalize">{gender}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider">
              Speaking Speed: {settings.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider">
              Voice Pitch: {settings.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2 sm:mb-3 uppercase tracking-wider">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={settings.volume}
              onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testVoice}
            className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black hover:shadow-lg transition-all text-sm sm:text-base"
          >
            🎤 Test Voice
          </button>

          {/* Available Voices Info */}
          {availableVoices.length > 0 && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2 sm:p-3 rounded-xl">
              <p className="font-bold mb-1">Available voices: {availableVoices.length}</p>
              <p>The system will automatically select the best voice for your chosen language and gender.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};