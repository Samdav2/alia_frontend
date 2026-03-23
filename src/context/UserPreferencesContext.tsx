"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type HighContrastMode = 'standard' | 'dark' | 'yellow';

interface UserPreferences {
  bionicReading: boolean;
  dyslexiaFont: boolean;
  highContrast: HighContrastMode;
  voiceNavigation: boolean;
  // Legacy support
  isDyslexicMode?: boolean;
  isHighContrast?: boolean;
  isVoiceNavActive?: boolean;
  isGazeScrollActive?: boolean;
  isAutoPilotActive?: boolean;
}

interface UserPreferencesContextType extends UserPreferences {
  setBionicReading: (val: boolean) => void;
  setDyslexiaFont: (val: boolean) => void;
  setHighContrast: (val: HighContrastMode) => void;
  setVoiceNavigation: (val: boolean) => void;
  // Legacy support
  setDyslexicMode?: (val: boolean) => void;
  setVoiceNavActive?: (val: boolean) => void;
  setGazeScrollActive?: (val: boolean) => void;
  toggleDyslexicMode?: () => void;
  toggleHighContrast?: () => void;
  toggleVoiceNavActive?: () => void;
  toggleGazeScrollActive?: () => void;
  setAutoPilotActive?: (val: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  bionicReading: false,
  dyslexiaFont: false,
  highContrast: 'standard',
  voiceNavigation: false,
  isDyslexicMode: false,
  isHighContrast: false,
  isVoiceNavActive: false,
  isGazeScrollActive: false,
  isAutoPilotActive: false,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("user-preferences");
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved preferences", e);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("user-preferences", JSON.stringify(prefs));

    // Apply global classes to document root for better control
    const root = document.documentElement;

    // Dyslexia Mode
    if (prefs.dyslexiaFont || prefs.isDyslexicMode) {
      document.body.classList.add("dyslexic-mode");
      root.style.fontFamily = 'OpenDyslexic, Arial, sans-serif';
    } else {
      document.body.classList.remove("dyslexic-mode");
      root.style.fontFamily = '';
    }

    // High Contrast Mode
    document.body.classList.remove('high-contrast-standard', 'high-contrast-dark', 'high-contrast-yellow');

    if (prefs.highContrast === 'dark') {
      document.body.classList.add('high-contrast-dark');
      root.style.backgroundColor = '#000000';
      root.style.color = '#ffffff';
    } else if (prefs.highContrast === 'yellow') {
      document.body.classList.add('high-contrast-yellow');
      root.style.backgroundColor = '#000000';
      root.style.color = '#ffff00';
    } else {
      document.body.classList.add('high-contrast-standard');
      root.style.backgroundColor = '';
      root.style.color = '';
    }
  }, [prefs]);

  const setBionicReading = (val: boolean) => setPrefs((p) => ({ ...p, bionicReading: val }));
  const setDyslexiaFont = (val: boolean) => setPrefs((p) => ({ ...p, dyslexiaFont: val, isDyslexicMode: val }));
  const setHighContrast = (val: HighContrastMode) => setPrefs((p) => ({ ...p, highContrast: val, isHighContrast: val !== 'standard' }));
  const setVoiceNavigation = (val: boolean) => setPrefs((p) => ({ ...p, voiceNavigation: val, isVoiceNavActive: val }));

  // Legacy support
  const setDyslexicMode = (val: boolean) => setDyslexiaFont(val);
  const setVoiceNavActive = (val: boolean) => setVoiceNavigation(val);
  const setGazeScrollActive = (val: boolean) => setPrefs((p) => ({ ...p, isGazeScrollActive: val }));

  const toggleDyslexicMode = () => setDyslexiaFont(!prefs.dyslexiaFont);
  const toggleHighContrast = () => setHighContrast(prefs.highContrast === 'standard' ? 'dark' : 'standard');
  const toggleVoiceNavActive = () => setVoiceNavigation(!prefs.voiceNavigation);
  const toggleGazeScrollActive = () => setGazeScrollActive(!prefs.isGazeScrollActive);
  const setAutoPilotActive = (val: boolean) => setPrefs((p) => ({ ...p, isAutoPilotActive: val }));

  return (
    <UserPreferencesContext.Provider
      value={{
        ...prefs,
        setBionicReading,
        setDyslexiaFont,
        setHighContrast,
        setVoiceNavigation,
        setDyslexicMode,
        setVoiceNavActive,
        setGazeScrollActive,
        toggleDyslexicMode,
        toggleHighContrast,
        toggleVoiceNavActive,
        toggleGazeScrollActive,
        setAutoPilotActive,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};

// Export the context itself for components that need it
export { UserPreferencesContext };
