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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-xl sm:text-2xl z-40 ${
          isChatPage ? 'left-6' : 'right-6'
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
