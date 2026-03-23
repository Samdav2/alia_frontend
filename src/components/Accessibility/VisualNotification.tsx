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
      className={`fixed top-4 right-4 z-[9999] ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl border-4 animate-bounce-in max-w-md`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">{icons[type]}</span>
        <p className="font-bold text-lg">{message}</p>
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
