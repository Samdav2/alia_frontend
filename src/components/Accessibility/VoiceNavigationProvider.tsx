'use client';

import React, { useEffect } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

interface VoiceNavigationProviderProps {
  children: React.ReactNode;
}

export const VoiceNavigationProvider: React.FC<VoiceNavigationProviderProps> = ({
  children,
}) => {
  const { voiceNavigation } = useUserPreferences();
  
  // Voice navigation is managed by the accessibility menu
  // No need to initialize here to avoid infinite loops
  
  return <>{children}</>;
};