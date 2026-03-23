'use client';

import React, { useState, useCallback } from 'react';
import { lecturerService, FileUploadResponse } from '@/services/api/lecturerService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

interface FileUploadZoneProps {
  context: {
    type: 'course' | 'module' | 'topic' | 'general';
    courseId?: string;
    moduleId?: string;
    topicId?: string;
  };
  onUploadComplete?: (file: FileUploadResponse) => void;
  onUploadStart?: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: FileUploadResponse;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  context,
  onUploadComplete,
  onUploadStart,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  maxSize = 100, // 100MB default
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { showNotification } = useVisualNotification();

  const getFileType = (file: File): 'thumbnail' | 'video' | 'document' | 'resource' | 'image' => {
    if (file.type.startsWith('image/')) {
      return file.size < 5 * 1024 * 1024 ? 'thumbnail' : 'image'; // < 5MB = thumbnail
    }
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf' || 
        file.type.includes('document') || 
        file.type.includes('presentation')) return 'document';
    return 'resource';
  };

  const validateFile = (file: File): string | null => {
    // Size check
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Type check
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `File type not supported. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<void> => {
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const uploadingFile: UploadingFile = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading'
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);
    onUploadStart?.();

    try {
      // Simulate progress updates (in real implementation, you'd get this from the upload)
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId && f.progress < 90 
            ? { ...f, progress: f.progress + Math.random() * 20 }
            : f
        ));
      }, 500);

      const fileType = getFileType(file);
      const result = await lecturerService.uploadFile(file, fileType, context);

      clearInterval(progressInterval);

      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, progress: 100, status: 'completed', result }
          : f
      ));

      showNotification(`${file.name} uploaded successfully! 📁`, 'success');
      onUploadComplete?.(result);

      // Remove from uploading list after 3 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      }, 3000);

    } catch (error) {
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'failed', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));

      showNotification(`Failed to upload ${file.name}`, 'error');
      console.error('Upload error:', error);
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        showNotification(`${file.name}: ${validationError}`, 'error');
        continue;
      }
      
      await uploadFile(file);
    }
  }, [context, maxSize, acceptedTypes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const getContextLabel = () => {
    switch (context.type) {
      case 'course': return 'Course Files';
      case 'module': return 'Module Resources';
      case 'topic': return 'Topic Materials';
      default: return 'General Files';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">
            {dragActive ? '📥' : '📁'}
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              {dragActive ? 'Drop files here!' : `Upload ${getContextLabel()}`}
            </h4>
            <p className="text-slate-600 text-sm mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-slate-500">
              Max size: {maxSize}MB • Supported: {acceptedTypes.join(', ')}
            </p>
          </div>
          
          {!dragActive && (
            <div className="flex justify-center gap-3">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInput}
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer transition-all hover-lift"
              >
                Browse Files
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-bold text-slate-900 text-sm">Uploading Files</h5>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {uploadingFile.status === 'completed' ? '✅' : 
                     uploadingFile.status === 'failed' ? '❌' : '📄'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {uploadingFile.status === 'uploading' && (
                    <span className="text-blue-600 font-bold text-sm">
                      {Math.round(uploadingFile.progress)}%
                    </span>
                  )}
                  {uploadingFile.status === 'completed' && (
                    <span className="text-green-600 font-bold text-sm">Complete</span>
                  )}
                  {uploadingFile.status === 'failed' && (
                    <span className="text-red-600 font-bold text-sm">Failed</span>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {uploadingFile.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress}%` }}
                  />
                </div>
              )}
              
              {/* Error Message */}
              {uploadingFile.status === 'failed' && uploadingFile.error && (
                <p className="text-red-600 text-xs mt-2">{uploadingFile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};