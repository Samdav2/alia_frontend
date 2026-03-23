'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { VisualNotification, useVisualNotification } from './VisualNotification';
import { textToSpeechService } from '@/services/textToSpeechService';
import { autonomousAgentService } from '@/services/autonomousAgentService';

export const NotificationTest: React.FC = () => {
  const { notification, showNotification, clearNotification } = useVisualNotification();
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on the chat page
  const isChatPage = pathname?.includes('/chat');

  const testNotifications = [
    {
      type: 'success' as const,
      message: 'Course completed successfully! 🎉',
      voiceMessage: 'Congratulations! You have successfully completed the course.',
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      type: 'warning' as const,
      message: 'Assignment deadline approaching ⚠️',
      voiceMessage: 'Warning: Your assignment deadline is approaching. Please submit soon.',
      bgColor: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      type: 'error' as const,
      message: 'Connection lost. Please check internet 🔌',
      voiceMessage: 'Error: Connection lost. Please check your internet connection.',
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      type: 'info' as const,
      message: 'New learning material available 📚',
      voiceMessage: 'Information: New learning material is now available for you.',
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    }
  ];

  const handleNotificationTest = (testItem: typeof testNotifications[0]) => {
    // Show visual notification
    showNotification(testItem.message, testItem.type);
    
    // Announce with voice if enabled
    if (autonomousAgentService.getVoiceEnabled()) {
      textToSpeechService.announce(testItem.voiceMessage);
    }
  };

  const resetAllProgress = () => {
    if (confirm('Are you sure you want to reset ALL course progress? This cannot be undone.')) {
      // Reset course progress
      localStorage.removeItem('course-progress');
      
      // Reset autonomous agent
      autonomousAgentService.resetProgress();
      
      // Show confirmation
      showNotification('All course progress has been reset! 🔄', 'info');
      
      if (autonomousAgentService.getVoiceEnabled()) {
        textToSpeechService.announce('All course progress has been reset. You can start fresh.');
      }
      
      // Refresh page after delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const resetSpecificCourse = (courseId: string) => {
    if (confirm(`Reset progress for Course ${courseId}?`)) {
      const progress = localStorage.getItem('course-progress');
      if (progress) {
        try {
          const data = JSON.parse(progress);
          delete data[courseId];
          localStorage.setItem('course-progress', JSON.stringify(data));
          
          showNotification(`Course ${courseId} progress reset! 🔄`, 'info');
          
          if (autonomousAgentService.getVoiceEnabled()) {
            textToSpeechService.announce(`Course ${courseId} progress has been reset.`);
          }
        } catch (e) {
          console.error('Failed to reset course progress', e);
        }
      }
    }
  };

  return (
    <>
      {/* Toggle Button - Positioned higher to avoid input obstruction */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-[17rem] sm:bottom-40 z-[70] w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-110 flex items-center justify-center font-black ${
          isChatPage ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
        }`}
        title="Test Notifications & Reset"
      >
        🧪
      </button>

      {/* Test Panel - Positioned higher */}
      {isVisible && (
        <div className={`fixed bottom-[20rem] sm:bottom-56 z-[70] w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-16rem)] overflow-y-auto ${
          isChatPage ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Test Center</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Notification Tests */}
            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                🔔 Notification Tests
              </h4>
              <div className="space-y-2">
                {testNotifications.map((test, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNotificationTest(test)}
                    className={`w-full px-3 py-2 text-white rounded-xl font-bold text-sm transition-all hover-lift ${test.bgColor} ${test.hoverColor}`}
                  >
                    Test {test.type.charAt(0).toUpperCase() + test.type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Reset */}
            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                🔄 Reset Options
              </h4>
              <div className="space-y-2">
                <button
                  onClick={resetAllProgress}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all hover-lift"
                >
                  Reset All Progress
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  {['1', '2', '3', '4'].map((courseId) => (
                    <button
                      key={courseId}
                      onClick={() => resetSpecificCourse(courseId)}
                      className="px-2 py-1 bg-orange-500 text-white rounded-lg font-bold text-xs hover:bg-orange-600 transition-all"
                    >
                      Reset Course {courseId}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Test */}
            <div>
              <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                🎤 Voice Test
              </h4>
              <button
                onClick={() => textToSpeechService.announce('This is a voice test. The notification system is working correctly.')}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-all hover-lift"
              >
                Test Voice Announcement
              </button>
            </div>

            {/* System Info */}
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
              <p className="font-bold mb-1">🔧 Debug Info:</p>
              <p>Voice: {autonomousAgentService.getVoiceEnabled() ? 'Enabled' : 'Disabled'}</p>
              <p>Agent: {autonomousAgentService.getState().isActive ? 'Active' : 'Inactive'}</p>
              <p>Courses: {autonomousAgentService.getState().coursesCompleted.length}/4 completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Notification Display */}
      {notification && (
        <VisualNotification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </>
  );
};