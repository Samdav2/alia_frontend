'use client';

import React, { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { FileManager } from './FileManager';
import { FileUploadResponse, FileInfo } from '@/services/api/lecturerService';

interface FileUploadManagerProps {
  context: {
    type: 'course' | 'module' | 'topic' | 'general';
    courseId?: string;
    moduleId?: string;
    topicId?: string;
  };
  onFileSelect?: (file: FileInfo) => void;
  onFileUpload?: (file: FileUploadResponse) => void;
  showUploadZone?: boolean;
  showFileManager?: boolean;
  showReadAloud?: boolean; // Enable read-aloud for students
  className?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  context,
  onFileSelect,
  onFileUpload,
  showUploadZone = true,
  showFileManager = true,
  showReadAloud = false,
  className = ''
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = (file: FileUploadResponse) => {
    onFileUpload?.(file);
    // Refresh file manager
    setRefreshKey(prev => prev + 1);
  };

  const handleFileDelete = () => {
    // Refresh file manager
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {showUploadZone && (
        <FileUploadZone
          context={context}
          onUploadComplete={handleUploadComplete}
        />
      )}
      
      {showFileManager && (
        <FileManager
          key={refreshKey}
          context={context}
          onFileSelect={onFileSelect}
          onFileDelete={handleFileDelete}
          showReadAloud={showReadAloud}
        />
      )}
    </div>
  );
};