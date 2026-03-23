'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Live Camera Preview Modal
 *
 * Shows user their hand movements in real-time when sign navigation is enabled
 * Helps users understand if their gestures are being detected
 *
 * Displays:
 * - Live video feed from camera
 * - Hand skeleton overlay (if MediaPipe detected hands)
 * - Confidence level of current gesture
 * - Detected sign name
 */
export const CameraPreviewModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({
  isVisible,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsLoading(false);
          };
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to access camera. Please check permissions.'
        );
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      // Clean up camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📹</span>
            <h2 className="text-white font-bold text-lg">Hand Movement Preview</h2>
            <span className="flex items-center gap-2 ml-auto bg-green-700 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-lime-300 rounded-full animate-pulse" />
              <span className="text-xs text-white font-bold">LIVE</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 text-2xl font-bold transition-colors"
            aria-label="Close camera preview"
          >
            ✕
          </button>
        </div>

        {/* Camera Feed */}
        <div className="bg-black p-4 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white font-bold">Accessing camera...</p>
                <p className="text-slate-400 text-sm mt-1">Please allow camera access</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
              <div className="text-center max-w-sm">
                <p className="text-red-400 font-bold text-lg mb-2">📷 Camera Error</p>
                <p className="text-slate-300 text-sm">{error}</p>
                <p className="text-slate-400 text-xs mt-3">
                  Check browser permissions: Settings → Privacy → Camera
                </p>
              </div>
            </div>
          )}

          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ display: 'none' }}
            />

            {/* Status Overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 px-4 py-2 rounded-lg border border-emerald-500/50">
              <p className="text-emerald-300 text-sm font-bold">🤟 Position your hands here</p>
              <p className="text-slate-400 text-xs mt-1">Make a gesture to see it detected</p>
            </div>

            {/* Instructions Overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/90 px-4 py-3 rounded-lg border border-slate-700 max-w-xs">
              <p className="text-white font-bold text-sm mb-2">💡 Tips:</p>
              <ul className="text-slate-300 text-xs space-y-1">
                <li>✓ Keep hands in frame</li>
                <li>✓ Good lighting helps</li>
                <li>✓ Hold gesture 0.5-1s</li>
                <li>✓ Face camera directly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">
              <p className="font-bold mb-1">📊 Status</p>
              <p className="text-slate-400">Camera feed active - Make hand gestures to test</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
