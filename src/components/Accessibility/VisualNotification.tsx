'use client';

import React, { useEffect, useState } from 'react';

interface VisualNotificationProps {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const VisualNotification: React.FC<VisualNotificationProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Add flash-border class to body — keyframes are defined in globals.css
    document.body.classList.add(`flash-border-${type}`);

    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.classList.remove(`flash-border-${type}`);
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove(`flash-border-${type}`);
    };
  }, [type, duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-green-500 border-green-600',
    warning: 'bg-yellow-500 border-yellow-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
  };

  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed top-4 sm:top-6 left-1/2 sm:left-auto sm:right-6 -translate-x-1/2 sm:translate-x-0 z-[10000] ${colors[type]} text-white px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] border-2 sm:border-4 border-white/20 animate-bounce-in w-[calc(100%-32px)] sm:w-auto max-w-md backdrop-blur-md`}
      role="alert"
      aria-live="assertive"
      onClick={() => {
        setIsVisible(false);
        onClose?.();
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
          {icons[type]}
        </div>
        <p className="font-black text-base sm:text-lg leading-tight">{message}</p>
      </div>
    </div>
  );
};

/**
 * Hook for showing visual notifications
 */
export const useVisualNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  const showNotification = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    showNotification,
    clearNotification,
  };
};
