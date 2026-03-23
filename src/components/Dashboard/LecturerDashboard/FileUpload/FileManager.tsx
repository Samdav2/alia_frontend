'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, FileInfo } from '@/services/api/lecturerService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';
import { ReadAloud } from '@/components/Accessibility/ReadAloud';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import BionicText from '@/components/Accessibility/BionicText';
import { ConfirmModal } from '@/components/Shared/ConfirmModal';

interface FileManagerProps {
  context: {
    type: 'course' | 'module' | 'topic' | 'general';
    courseId?: string;
    moduleId?: string;
    topicId?: string;
  };
  onFileSelect?: (file: FileInfo) => void;
  onFileDelete?: (fileId: string) => void;
  showActions?: boolean;
  showReadAloud?: boolean; // Enable read-aloud functionality
  className?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  context,
  onFileSelect,
  onFileDelete,
  showActions = true,
  showReadAloud = false,
  className = ''
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const { showNotification } = useVisualNotification();
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
      console.log('📂 Loaded files:', filesData);
      console.log('📂 First file structure:', filesData[0]);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      showNotification('Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    console.log('🎯 FileManager: Starting delete for file:', fileId);
    try {
      await lecturerService.deleteFile(fileId);
      console.log('✅ FileManager: Delete successful, reloading files...');
      // Reload files to ensure we have the latest data
      await loadFiles();
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      showNotification('File deleted successfully', 'success');
      onFileDelete?.(fileId);
    } catch (error) {
      console.error('❌ FileManager: Delete failed:', error);
      showNotification('Failed to delete file', 'error');
    }
  };

  const handleDeleteClick = (fileId: string) => {
    console.log('🖱️ Delete button clicked for file:', fileId);
    console.log('📝 Setting fileToDelete state to:', fileId);
    setFileToDelete(fileId);
    setShowDeleteConfirm(true);
    console.log('📋 Modal should now be visible');
  };

  const confirmDelete = () => {
    console.log('✅ User confirmed delete. Current fileToDelete state:', fileToDelete);
    const fileId = fileToDelete;
    setShowDeleteConfirm(false);
    setFileToDelete(null);
    
    if (fileId) {
      console.log('🎯 Proceeding with delete for:', fileId);
      handleDeleteFile(fileId);
    } else {
      console.error('❌ No file ID to delete!');
    }
  };

  const handleBulkDeleteClick = () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    console.log('✅ User confirmed bulk delete for files:', Array.from(selectedFiles));
    selectedFiles.forEach(fileId => handleDeleteFile(fileId));
    setShowBulkDeleteConfirm(false);
  };

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
    setShowPreview(true);
    onFileSelect?.(file);
  };

  const canPreview = (mimeType: string): boolean => {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('video/') || 
           mimeType.includes('pdf');
  };

  const getFileDescription = (file: FileInfo): string => {
    return `${file.original_filename}, ${formatFileSize(file.size)}, uploaded on ${new Date(file.uploaded_at).toLocaleDateString()}`;
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string, type: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📁';
  };

  const getContextTitle = () => {
    switch (context.type) {
      case 'course': return 'Course Files';
      case 'module': return 'Module Resources';
      case 'topic': return 'Topic Materials';
      default: return 'Files';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-900">{getContextTitle()}</h4>
        </div>
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

  return (
    <>
    <div className={`space-y-4 ${className}`}>
      {/* Header - Improved Responsive Design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h4 className="font-bold text-slate-900 text-base sm:text-lg">{getContextTitle()}</h4>
          <p className="text-xs sm:text-sm text-slate-600">{files.length} files</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {selectedFiles.size > 0 && showActions && (
            <button
              onClick={handleBulkDeleteClick}
              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              Delete ({selectedFiles.size})
            </button>
          )}
          
          <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-bold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              aria-label="Grid view"
            >
              <span className="hidden sm:inline">Grid</span>
              <span className="sm:hidden">⊞</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-bold transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
              aria-label="List view"
            >
              <span className="hidden sm:inline">List</span>
              <span className="sm:hidden">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-4">📁</div>
          <h5 className="font-bold text-slate-900 mb-2">No files uploaded</h5>
          <p className="text-slate-600 text-sm">Upload files to see them here</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
        }>
          {files.map((file) => {
            return (
              <div key={file.id} className={`bg-white rounded-xl border border-gray-200 transition-all hover:shadow-md ${
                  selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${
                  viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'
                }`}
              >
              {viewMode === 'grid' ? (
                // Grid View - Improved Responsive Design
                <>
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                    <div className="text-3xl sm:text-4xl">
                      {getFileIcon(file.mime_type, file.type)}
                    </div>
                    {showActions && (
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {showReadAloud && (
                          <div className="scale-90 sm:scale-100">
                            <ReadAloud text={getFileDescription(file)} />
                          </div>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          aria-label={`Select ${file.original_filename}`}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔴 GRID DELETE BUTTON CLICKED! File ID:', file.id);
                            handleDeleteClick(file.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-base sm:text-lg p-1"
                          title="Delete file"
                          aria-label={`Delete ${file.original_filename}`}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h6 
                      className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-blue-600 break-words"
                      onClick={() => handleFileSelect(file)}
                      title={file.original_filename}
                    >
                      {bionicReading ? (
                        <BionicText text={file.original_filename} />
                      ) : (
                        file.original_filename
                      )}
                    </h6>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 gap-2">
                      <span className="truncate">{formatFileSize(file.size)}</span>
                      <span className="capitalize whitespace-nowrap">{file.type}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Action Buttons - Responsive */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    {canPreview(file.mime_type) && (
                      <button
                        onClick={() => handleFileSelect(file)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors"
                      >
                        👁️ Preview
                      </button>
                    )}
                    <a
                      href={file.url}
                      download={file.original_filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors text-center"
                    >
                      ⬇️ Download
                    </a>
                  </div>
                </>
              ) : (
                // List View - Improved Responsive Design
                <>
                  {showActions && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 flex-shrink-0"
                      aria-label={`Select ${file.original_filename}`}
                    />
                  )}
                  
                  <div className="text-xl sm:text-2xl flex-shrink-0">
                    {getFileIcon(file.mime_type, file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h6 
                      className="font-medium text-slate-900 text-xs sm:text-sm truncate cursor-pointer hover:text-blue-600"
                      onClick={() => handleFileSelect(file)}
                      title={file.original_filename}
                    >
                      {bionicReading ? (
                        <BionicText text={file.original_filename} />
                      ) : (
                        file.original_filename
                      )}
                    </h6>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500 mt-1">
                      <span className="whitespace-nowrap">{formatFileSize(file.size)}</span>
                      <span className="capitalize whitespace-nowrap">{file.type}</span>
                      <span className="hidden sm:inline whitespace-nowrap">{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {showReadAloud && (
                      <div className="scale-90 sm:scale-100">
                        <ReadAloud text={getFileDescription(file)} />
                      </div>
                    )}
                    {canPreview(file.mime_type) && (
                      <button
                        onClick={() => handleFileSelect(file)}
                        className="text-blue-500 hover:text-blue-700 text-base sm:text-lg p-1"
                        title="Preview file"
                        aria-label={`Preview ${file.original_filename}`}
                      >
                        👁️
                      </button>
                    )}
                    <a
                      href={file.url}
                      download={file.original_filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-700 text-base sm:text-lg p-1"
                      title="Download file"
                      aria-label={`Download ${file.original_filename}`}
                    >
                      ⬇️
                    </a>
                    {showActions && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔵 LIST DELETE BUTTON CLICKED! File ID:', file.id);
                          handleDeleteClick(file.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-base sm:text-lg p-1"
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
            );
          })}
        </div>
      )}
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
              <a
                href={selectedFile.url}
                download={selectedFile.original_filename}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                ⬇️ Download
              </a>
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
                <div className="text-6xl mb-4">{getFileIcon(selectedFile.mime_type, selectedFile.type)}</div>
                <h4 className="font-bold text-slate-900 mb-2">Preview not available</h4>
                <p className="text-slate-600 mb-2">This file type cannot be previewed in the browser</p>
                <p className="text-sm text-slate-500 mb-6">File type: {selectedFile.mime_type}</p>
                <a
                  href={selectedFile.url}
                  download={selectedFile.original_filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Download to View
                </a>
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

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => {
        setShowDeleteConfirm(false);
        setFileToDelete(null);
      }}
      onConfirm={() => {
        console.log('✅ Modal confirm clicked. fileToDelete:', fileToDelete);
        if (fileToDelete) {
          handleDeleteFile(fileToDelete);
        }
        setShowDeleteConfirm(false);
        setFileToDelete(null);
      }}
      title="Delete File"
      message="Are you sure you want to delete this file? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />

    {/* Bulk Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={showBulkDeleteConfirm}
      onClose={() => setShowBulkDeleteConfirm(false)}
      onConfirm={confirmBulkDelete}
      title="Delete Multiple Files"
      message={`Are you sure you want to delete ${selectedFiles.size} selected files? This action cannot be undone.`}
      confirmText="Delete All"
      cancelText="Cancel"
      type="danger"
    />
    </>
  );
};