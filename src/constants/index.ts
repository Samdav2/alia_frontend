// Global constants

export const DEPARTMENTS = [
  'Education',
  'Engineering',
  'Business',
  'Science',
  'Arts',
  'Medicine',
  'Law',
];

export const COURSE_STATUSES = ['active', 'archived', 'draft'] as const;

export const USER_ROLES = ['student', 'lecturer', 'admin'] as const;

export const USER_STATUSES = ['active', 'pending', 'inactive'] as const;

export const HIGH_CONTRAST_MODES = ['standard', 'dark', 'yellow'] as const;

export const PERFORMANCE_THRESHOLDS = {
  excellent: 85,
  good: 70,
  warning: 50,
  critical: 0,
} as const;

export const API_ENDPOINTS = {
  COURSES: '/api/courses',
  USERS: '/api/users',
  ANALYTICS: {
    ACCESSIBILITY: '/api/analytics/accessibility',
    PERFORMANCE: '/api/analytics/performance',
    SYSTEM_HEALTH: '/api/analytics/system-health',
  },
  AI: {
    SIMPLIFY: '/api/ai/simplify',
  },
} as const;
