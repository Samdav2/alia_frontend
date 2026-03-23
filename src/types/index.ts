// Global type definitions

export type UserRole = 'student' | 'lecturer' | 'admin';
export type UserStatus = 'active' | 'pending' | 'inactive';
export type HighContrastMode = 'standard' | 'dark' | 'yellow';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type Trend = 'up' | 'down' | 'stable';
export type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'critical';

export interface UserPreferences {
  bionicReading: boolean;
  dyslexiaFont: boolean;
  highContrast: HighContrastMode;
  voiceNavigation: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
}
