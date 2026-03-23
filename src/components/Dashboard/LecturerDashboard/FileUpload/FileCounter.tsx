'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService } from '@/services/api/lecturerService';

interface FileCounterProps {
  context: {
    type: 'course' | 'module' | 'topic' | 'general';
    courseId?: string;
    moduleId?: string;
    topicId?: string;
  };
  className?: string;
}

export const FileCounter: React.FC<FileCounterProps> = ({ context, className = '' }) => {
  const [fileCount, setFileCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFileCount();
  }, [context]);

  const loadFileCount = async () => {
    try {
      setLoading(true);
      const files = await lecturerService.getFiles({
        courseId: context.courseId,
        moduleId: context.moduleId,
        topicId: context.topicId,
        context: context.type
      });
      setFileCount(files.length);
    } catch (error) {
      console.error('Error loading file count:', error);
      setFileCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}>
        <span className="animate-pulse">📁</span>
        <span>...</span>
      </span>
    );
  }

  if (fileCount === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}>
        <span>📁</span>
        <span>No files</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-blue-600 font-medium ${className}`}>
      <span>📁</span>
      <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
    </span>
  );
};