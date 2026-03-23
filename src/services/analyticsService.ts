// Analytics-related API calls

export interface AccessibilityMetric {
  feature: string;
  usageHours: number;
  activeUsers: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AccessibilityAnalytics {
  totalUsageHours: number;
  activeUsers: number;
  features: AccessibilityMetric[];
}

export interface StudentPerformance {
  id: string;
  name: string;
  studentId: string;
  quizScore: number;
  timeSpent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface PerformanceAnalytics {
  courseId: string;
  students: StudentPerformance[];
}

export const analyticsService = {
  async getAccessibilityAnalytics(): Promise<AccessibilityAnalytics> {
    const response = await fetch('/api/analytics/accessibility');
    if (!response.ok) throw new Error('Failed to fetch accessibility analytics');
    return response.json();
  },

  async getPerformanceAnalytics(courseId: string): Promise<PerformanceAnalytics> {
    const url = new URL('/api/analytics/performance', window.location.origin);
    url.searchParams.append('courseId', courseId);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch performance analytics');
    return response.json();
  },

  async getSystemHealth() {
    const response = await fetch('/api/analytics/system-health');
    if (!response.ok) throw new Error('Failed to fetch system health');
    return response.json();
  },
};
