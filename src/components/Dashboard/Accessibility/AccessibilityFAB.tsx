'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AccessibilityMenu } from './AccessibilityMenu';

export const AccessibilityFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the chat page
  const isChatPage = pathname?.includes('/chat');

  return (
    <>
      {/* Floating Action Button - positioned higher to avoid input obstruction */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 sm:bottom-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-lg sm:text-2xl z-40 ${isChatPage ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
          }`}
        title="Accessibility Options"
      >
        ♿
      </button>

      {/* Menu */}
      {isOpen && (
        <AccessibilityMenu onClose={() => setIsOpen(false)} isChatPage={isChatPage} />
      )}
    </>
  );
};
