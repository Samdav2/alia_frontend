'use client';

import React, { useState } from 'react';
import { ContentArea } from './LearningRoom/ContentArea';
import { Curriculum } from './LearningRoom/Curriculum';
import { SimplifyButton } from './LearningRoom/SimplifyButton';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useAutoPilot } from '@/hooks/useAutoPilot';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { NotificationTest } from '@/components/Accessibility/NotificationTest';

interface LearningRoomProps {
  courseId: string;
  topicId: string;
}

export const LearningRoom: React.FC<LearningRoomProps> = ({
  courseId,
  topicId,
}) => {
  const [summary, setSummary] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('');
  const { isAutoPilotActive } = useUserPreferences();
  const { status, progress } = useAutoPilot();

  // Enable keyboard navigation
  const { announceStatus, announceHelp } = useKeyboardNavigation();

  // Update to use actual content from ContentArea
  const handleSimplify = async () => {
    // SimplifyButton will handle the actual simplification now
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden pb-24 lg:pb-0">
      {/* Main Content Area - 75% on desktop */}
      <div className="flex-1 bg-white relative lg:overflow-y-auto">
        {/* Autonomous Mode Status Banner */}
        {isAutoPilotActive && (
          <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse text-sm sm:text-base">
                  🤖
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider">
                    Autonomous Mode Active
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/80 font-medium">
                    {status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {progress > 0 && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none">
                    <div className="w-24 sm:w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-black">{progress}%</span>
                  </div>
                )}

                {/* Accessibility Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={announceStatus}
                    className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm"
                    title="Announce current status (Ctrl+H)"
                  >
                    📢
                  </button>
                  <button
                    onClick={announceHelp}
                    className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs sm:text-sm"
                    title="Keyboard shortcuts help (Shift+?)"
                  >
                    ❓
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ContentArea courseId={courseId} topicId={topicId} summary={summary} />

        {/* Floating AI Action Bar */}
        <div className="sticky bottom-8 left-4 right-4 sm:left-8 sm:right-8 z-30 pointer-events-none">
          <div className="max-w-3xl mx-auto flex justify-center">
            <div className="pointer-events-auto">
              <SimplifyButton
                onClick={handleSimplify}
                isLoading={isLoading}
                hasSummary={!!summary}
              />
            </div>
          </div>
        </div>

        {/* Test Notifications - Development Tool */}
        <NotificationTest />
      </div>

      {/* Curriculum Sidebar - 25% */}
      <div className="w-full lg:w-96 glass-nav lg:h-full border-l border-white/40 overflow-y-auto shadow-2xl">
        <Curriculum courseId={courseId} currentTopicId={topicId} />
      </div>
    </div>
  );
};
