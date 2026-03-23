'use client';

import { useEffect } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { autonomousAgentService } from '@/services/autonomousAgentService';
import { textToSpeechService } from '@/services/textToSpeechService';

export const useKeyboardNavigation = () => {
  const { isAutoPilotActive, setAutoPilotActive } = useUserPreferences();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'a':
          // Toggle autonomous mode
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setAutoPilotActive?.(!isAutoPilotActive);
            textToSpeechService.announce(
              isAutoPilotActive 
                ? 'Autonomous mode deactivated' 
                : 'Autonomous mode activated'
            );
          }
          break;

        case 'v':
          // Toggle voice
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const currentVoice = autonomousAgentService.getVoiceEnabled();
            autonomousAgentService.setVoiceEnabled(!currentVoice);
            textToSpeechService.announce(
              currentVoice ? 'Voice disabled' : 'Voice enabled'
            );
          }
          break;

        case 's':
          // Stop current speech
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            textToSpeechService.stop();
          }
          break;

        case 'h':
          // Help - announce current status
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const state = autonomousAgentService.getState();
            if (state.isActive) {
              textToSpeechService.announce(
                `Autonomous mode is active. Current status: ${state.status}. Progress: ${state.progress} percent.`
              );
            } else {
              textToSpeechService.announce(
                'Autonomous mode is inactive. Press Control A to start autonomous learning.'
              );
            }
          }
          break;

        case 'r':
          // Read current content
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const content = document.querySelector('.prose')?.textContent || 
                           document.querySelector('main')?.textContent || 
                           'No content found to read';
            textToSpeechService.readContent(content.slice(0, 500)); // First 500 chars
          }
          break;

        case '?':
          // Keyboard shortcuts help
          if (event.shiftKey) {
            event.preventDefault();
            const shortcuts = `
              Keyboard shortcuts available:
              Control A: Toggle autonomous mode.
              Control V: Toggle voice announcements.
              Control S: Stop current speech.
              Control H: Get current status.
              Control R: Read current content.
              Shift Question mark: This help message.
            `;
            textToSpeechService.announce(shortcuts);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isAutoPilotActive, setAutoPilotActive]);

  return {
    // Expose functions for programmatic use
    announceStatus: () => {
      const state = autonomousAgentService.getState();
      if (state.isActive) {
        textToSpeechService.announce(
          `Autonomous mode active. ${state.status}. Progress: ${state.progress}%.`
        );
      } else {
        textToSpeechService.announce('Autonomous mode inactive.');
      }
    },
    
    announceHelp: () => {
      textToSpeechService.announce(
        'Press Control A to toggle autonomous mode. Press Control V to toggle voice. Press Shift Question mark for all shortcuts.'
      );
    }
  };
};