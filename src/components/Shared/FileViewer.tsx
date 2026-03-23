'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, FileInfo } from '@/services/api/lecturerService';
import { ReadAloud } from '@/components/Accessibility/ReadAloud';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import BionicText from '@/components/Accessibility/BionicText';

interface FileViewerProps {
  context: {
    type: 'course' | 'module' | 'topic' | 'general';
    courseId?: string;
    moduleId?: string;
    topicId?: string;
  };
  showReadAloud?: boolean; // Enable for students
  showDownload?: boolean;
  showDelete?: boolean; // Enable for admin/lecturer
  onFileDelete?: (fileId: string) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const FileViewer: React.FC<FileViewerProps> = ({
  context,
  showReadAloud = false,
  showDownload = true,
  showDelete = false,
  onFileDelete,
  className = '',
  viewMode: initialViewMode = 'grid'
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { bionicReading } = useUserPreferences();

  useEffect(() => {
    loadFiles();
  }, [context]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await lecturerService.getFiles({
        courseId: context.courseId,
        moduleId: context.moduleId,
        topicId: context.topicId,
        context: context.type
      });
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await lecturerService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      onFileDelete?.(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleFileClick = (file: FileInfo) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📁';
  };

  const canPreview = (mimeType: string): boolean => {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('video/') || 
           mimeType.includes('pdf');
  };

  const getFileDescription = (file: FileInfo): string => {
    return `${file.original_filename}, ${formatFileSize(file.size)}, uploaded on ${new Date(file.uploaded_at).toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 bg-gray-50 rounded-2xl ${className}`}>
        <div className="text-4xl mb-3">📁</div>
        <h5 className="font-bold text-slate-900 mb-2">No files available</h5>
        <p className="text-slate-600 text-sm">Files will appear here when uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900">Course Materials</h4>
            <p className="text-sm text-slate-600">{files.length} file{files.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              aria-label="Grid view"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Files Display */}
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
        }>
          {files.map((file) => (
            <div
              key={file.id}
              className={`bg-white rounded-xl border border-gray-200 transition-all hover:shadow-md ${
                viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">
                      {getFileIcon(file.mime_type)}
                    </div>
                    <div className="flex items-center gap-2">
                      {showReadAloud && (
                        <ReadAloud text={getFileDescription(file)} />
                      )}
                      {showDelete && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Delete file"
                          aria-label={`Delete ${file.original_filename}`}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h6 
                      className="font-medium text-slate-900 text-sm line-clamp-2 cursor-pointer hover:text-blue-600"
                      onClick={() => handleFileClick(file)}
                      title={file.original_filename}
                    >
                      {bionicReading ? (
                        <BionicText text={file.original_filename} />
                      ) : (
                        file.original_filename
                      )}
                    </h6>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="capitalize">{file.type}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Image Preview */}
                  {file.mime_type.startsWith('image/') && (
                    <div className="mt-3">
                      <img
                        src={file.url}
                        alt={file.original_filename}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => handleFileClick(file)}
                      />
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    {canPreview(file.mime_type) && (
                      <button
                        onClick={() => handleFileClick(file)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                      >
                        👁️ Preview
                      </button>
                    )}
                    {showDownload && (
                      <a
                        href={file.url}
                        download={file.original_filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors text-center"
                      >
                        ⬇️ Download
                      </a>
                    )}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="text-2xl">
                    {getFileIcon(file.mime_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h6 
                      className="font-medium text-slate-900 text-sm truncate cursor-pointer hover:text-blue-600"
                      onClick={() => handleFileClick(file)}
                      title={file.original_filename}
                    >
                      {bionicReading ? (
                        <BionicText text={file.original_filename} />
                      ) : (
                        file.original_filename
                      )}
                    </h6>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="capitalize">{file.type}</span>
                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showReadAloud && (
                      <ReadAloud text={getFileDescription(file)} />
                    )}
                    {canPreview(file.mime_type) && (
                      <button
                        onClick={() => handleFileClick(file)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                        title="Preview file"
                        aria-label={`Preview ${file.original_filename}`}
                      >
                        👁️
                      </button>
                    )}
                    {showDownload && (
                      <a
                        href={file.url}
                        download={file.original_filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-500 hover:text-green-700 text-sm"
                        title="Download file"
                        aria-label={`Download ${file.original_filename}`}
                      >
                        ⬇️
                      </a>
                    )}
                    {showDelete && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete file"
                        aria-label={`Delete ${file.original_filename}`}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">
                  {selectedFile.original_filename}
                </h3>
                <p className="text-sm text-slate-600">
                  {formatFileSize(selectedFile.size)} • {new Date(selectedFile.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {showReadAloud && (
                  <ReadAloud text={`Viewing file: ${getFileDescription(selectedFile)}`} />
                )}
                {showDownload && (
                  <a
                    href={selectedFile.url}
                    download={selectedFile.original_filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    ⬇️ Download
                  </a>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Debug Information - Remove this in production */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs font-mono">
                <p><strong>File URL:</strong> {selectedFile.url || 'No URL available'}</p>
                <p><strong>MIME Type:</strong> {selectedFile.mime_type}</p>
                <p><strong>Can Preview:</strong> {canPreview(selectedFile.mime_type) ? 'Yes' : 'No'}</p>
                <p><strong>File Size:</strong> {formatFileSize(selectedFile.size)}</p>
              </div>

              {/* Image Preview */}
              {selectedFile.mime_type.startsWith('image/') && (
                <div className="space-y-4">
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.original_filename}
                    className="w-full h-auto rounded-lg max-h-[70vh] object-contain"
                    onLoad={() => console.log('Image loaded successfully:', selectedFile.url)}
                    onError={(e) => {
                      console.error('Image failed to load:', selectedFile.url);
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (errorDiv) {
                        e.currentTarget.style.display = 'none';
                        errorDiv.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="hidden text-center py-8 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-4xl mb-2">🖼️❌</div>
                    <p className="text-red-600 font-medium">Failed to load image</p>
                    <p className="text-sm text-red-500 mt-1 break-all">URL: {selectedFile.url}</p>
                    <p className="text-xs text-red-400 mt-2">The image file may not exist or the URL is invalid</p>
                  </div>
                </div>
              )}
              
              {/* Video Preview */}
              {selectedFile.mime_type.startsWith('video/') && (
                <div className="space-y-4">
                  <video
                    src={selectedFile.url}
                    controls
                    className="w-full h-auto rounded-lg max-h-[70vh]"
                    onLoadedData={() => console.log('Video loaded successfully:', selectedFile.url)}
                    onError={(e) => {
                      console.error('Video failed to load:', selectedFile.url);
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (errorDiv) {
                        e.currentTarget.style.display = 'none';
                        errorDiv.classList.remove('hidden');
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="hidden text-center py-8 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-4xl mb-2">🎥❌</div>
                    <p className="text-red-600 font-medium">Failed to load video</p>
                    <p className="text-sm text-red-500 mt-1 break-all">URL: {selectedFile.url}</p>
                    <p className="text-xs text-red-400 mt-2">The video file may not exist or the format is not supported</p>
                  </div>
                </div>
              )}
              
              {/* PDF Preview */}
              {selectedFile.mime_type.includes('pdf') && (
                <div className="space-y-4">
                  <iframe
                    src={selectedFile.url}
                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                    title={selectedFile.original_filename}
                    onLoad={() => console.log('PDF loaded successfully:', selectedFile.url)}
                    onError={(e) => {
                      console.error('PDF failed to load:', selectedFile.url);
                      const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                      if (errorDiv) {
                        e.currentTarget.style.display = 'none';
                        errorDiv.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="hidden text-center py-8 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-4xl mb-2">📄❌</div>
                    <p className="text-red-600 font-medium">Failed to load PDF</p>
                    <p className="text-sm text-red-500 mt-1 break-all">URL: {selectedFile.url}</p>
                    <p className="text-xs text-red-400 mt-2">Try downloading the file instead</p>
                  </div>
                </div>
              )}
              
              {/* No Preview Available */}
              {!canPreview(selectedFile.mime_type) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{getFileIcon(selectedFile.mime_type)}</div>
                  <h4 className="font-bold text-slate-900 mb-2">Preview not available</h4>
                  <p className="text-slate-600 mb-2">This file type cannot be previewed in the browser</p>
                  <p className="text-sm text-slate-500 mb-6">File type: {selectedFile.mime_type}</p>
                  {showDownload && (
                    <a
                      href={selectedFile.url}
                      download={selectedFile.original_filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Download to View
                    </a>
                  )}
                </div>
              )}

              {/* Fallback for empty/invalid URLs */}
              {(!selectedFile.url || selectedFile.url === '') && (
                <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h4 className="font-bold text-slate-900 mb-2">No file URL available</h4>
                  <p className="text-slate-600 mb-2">The file URL is missing or invalid</p>
                  <p className="text-sm text-slate-500">This usually means the backend file storage is not set up yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};