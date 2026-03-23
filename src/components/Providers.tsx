'use client';

import React, { ReactNode } from 'react';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <UserPreferencesProvider>
      {children}
    </UserPreferencesProvider>
  );
};
