'use client';

import React, { useState } from 'react';

interface AccessibilityDropdownProps {
  onClose: () => void;
}

export const AccessibilityDropdown: React.FC<AccessibilityDropdownProps> = ({
  onClose,
}) => {
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  React.useEffect(() => {
    if (dyslexiaFont) {
      document.documentElement.style.fontFamily = 'OpenDyslexic, sans-serif';
    } else {
      document.documentElement.style.fontFamily = 'inherit';
    }
  }, [dyslexiaFont]);

  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-64 z-50">
      <h3 className="font-bold text-slate-900 mb-4">Accessibility Options</h3>

      <div className="space-y-4">
        {/* Dyslexia Font */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <label className="font-medium text-slate-900 text-sm">
            Dyslexia Font
          </label>
          <button
            onClick={() => setDyslexiaFont(!dyslexiaFont)}
            className={`w-11 h-6 rounded-full transition-colors ${
              dyslexiaFont ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                dyslexiaFont ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <label className="font-medium text-slate-900 text-sm">
            High Contrast
          </label>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-11 h-6 rounded-full transition-colors ${
              highContrast ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors text-sm"
      >
        Close
      </button>
    </div>
  );
};
