'use client';

import { useState, useEffect } from 'react';
import {
  analyticsService,
  type AccessibilityAnalytics,
  type PerformanceAnalytics,
} from '@/services/analyticsService';

export const useAccessibilityAnalytics = () => {
  const [data, setData] = useState<AccessibilityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getAccessibilityAnalytics();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch analytics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const usePerformanceAnalytics = (courseId: string) => {
  const [data, setData] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsService.getPerformanceAnalytics(courseId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch analytics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  return { data, loading, error };
};
