'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

// ── Pinned Stable CDNs ──
const MP_VERSION = '0.4.1646424915';
const MP_HANDS_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}/hands.js`;

async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

// ── FEATURE EXTRACTION ──
const extractFeatures = (landmarks: any[]) => {
  const wrist = landmarks[0];
  const features: number[] = [];
  for (let i = 0; i < landmarks.length; i++) {
    features.push(landmarks[i].x - wrist.x);
    features.push(landmarks[i].y - wrist.y);
    features.push(landmarks[i].z - wrist.z);
  }
  return features;
};

// ── STRICT FINGER-CURLING MATHEMATICS ──
const checkFingers = (hand: any[]) => {
  // A finger is "Up" if its tip (e.g., 8) is higher than its lower joint (e.g., 6)
  const indexUp = hand[8].y < hand[6].y;
  const middleUp = hand[12].y < hand[10].y;
  const ringUp = hand[16].y < hand[14].y;
  const pinkyUp = hand[20].y < hand[18].y;

  // Distance between thumb tip [4] and index tip [8]
  const pinchDist = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
  const isPinching = pinchDist < 0.05;

  return { indexUp, middleUp, ringUp, pinkyUp, isPinching };
};

const ASL_TRAINING_PATTERNS: Record<string, (hand: any[]) => boolean> = {
  // 1. Point Up (Index only)
  SCROLL_UP: (hand) => {
    const f = checkFingers(hand);
    return f.indexUp && !f.middleUp && !f.ringUp && !f.pinkyUp && !f.isPinching;
  },

  // 2. Peace Sign (Index & Middle only)
  SCROLL_DOWN: (hand) => {
    const f = checkFingers(hand);
    return f.indexUp && f.middleUp && !f.ringUp && !f.pinkyUp && !f.isPinching;
  },

  // 3. Three Fingers (Index, Middle, Ring)
  GO_BACK: (hand) => {
    const f = checkFingers(hand);
    return f.indexUp && f.middleUp && f.ringUp && !f.pinkyUp && !f.isPinching;
  },

  // 4. Rock On (Index & Pinky)
  DASHBOARD: (hand) => {
    const f = checkFingers(hand);
    return f.indexUp && !f.middleUp && !f.ringUp && f.pinkyUp && !f.isPinching;
  },

  // 5. Open Hand (All 4 fingers up)
  ASK_FOR_HELP: (hand) => {
    const f = checkFingers(hand);
    return f.indexUp && f.middleUp && f.ringUp && f.pinkyUp && !f.isPinching;
  },

  // 6. Closed Fist (All 4 fingers down)
  STOP_VIDEO: (hand) => {
    const f = checkFingers(hand);
    return !f.indexUp && !f.middleUp && !f.ringUp && !f.pinkyUp;
  },

  // 7. OK Sign (Thumb & Index touching, others up)
  ATTEND_CLASS: (hand) => {
    const f = checkFingers(hand);
    return f.isPinching && f.middleUp && f.ringUp && f.pinkyUp;
  }
};

const SignInterpreter: React.FC<{ onSignDetected?: (sign: string) => void }> = ({ onSignDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState('Booting AI Engine...');
  const [error, setError] = useState<string | null>(null);
  const [currentSign, setCurrentSign] = useState<string>('Waiting for hands...');
  const [confidence, setConfidence] = useState(0);

  const activeRef = useRef(true);
  const handsRef = useRef<any>(null);
  const requestRef = useRef<number>(0);

  // 🚀 CPU & MEMORY SHIELDS
  const isProcessingRef = useRef(false);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastUpdateRef = useRef<number>(0); // Prevents React Re-render Spam

  const lastWristPosRef = useRef<{ x: number, y: number } | null>(null);
  const lastEventRef = useRef<number>(0); // Separate debounce for events

  const brainRef = useRef<tf.LayersModel | null>(null);
  const labelsRef = useRef<string[]>([]);

  const loadTrainedBrain = useCallback(async () => {
    try {
      const brain = await tf.loadLayersModel('/model.json');
      brainRef.current = brain;
      const labels = localStorage.getItem('sign_label_map');
      if (labels) labelsRef.current = JSON.parse(labels);
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  // ── AI Prediction ──
  const predictSign = useCallback((landmarks: any[]) => {
    let bestMatch = 'Tracking...';
    let highestScore = 0;

    const wrist = landmarks[0];
    let moveX = 0;
    let moveY = 0;

    if (lastWristPosRef.current) {
      moveX = wrist.x - lastWristPosRef.current.x;
      moveY = wrist.y - lastWristPosRef.current.y;
    }
    lastWristPosRef.current = { x: wrist.x, y: wrist.y };

    if (brainRef.current && labelsRef.current.length > 0) {
      try {
        const features = extractFeatures(landmarks);
        const input = tf.tensor2d([features]);
        const prediction = brainRef.current.predict(input) as tf.Tensor;
        const probs = prediction.dataSync();

        let maxIdx = 0, maxProb = probs[0];
        for (let i = 1; i < probs.length; i++) {
          if (probs[i] > maxProb) { maxProb = probs[i]; maxIdx = i; }
        }

        if (maxProb > 0.6) {
          bestMatch = labelsRef.current[maxIdx];
          highestScore = maxProb;
        }
        input.dispose();
        prediction.dispose();
      } catch (err) { }
    }

    if (highestScore < 0.6) {
      for (const [signName, checkPattern] of Object.entries(ASL_TRAINING_PATTERNS)) {
        try {
          if (checkPattern(landmarks)) {
            highestScore = 0.85;
            bestMatch = signName;
            break;
          }
        } catch (e) { }
      }
    }

    // 🛑 REACT THROTTLE: Only update the UI a maximum of 5 times per second!
    const now = performance.now();
    if (now - lastUpdateRef.current > 200) {
      setCurrentSign(bestMatch);
      setConfidence(highestScore);
      lastUpdateRef.current = now;
    }

    // Still fire the actual functional events so the website reacts instantly
    if (highestScore > 0.6 && bestMatch !== 'Tracking...') {
      // Small local debounce so we don't spam the router (use separate ref!)
      if (now - lastEventRef.current > 1000) {
        if (onSignDetected) onSignDetected(bestMatch);
        window.dispatchEvent(new CustomEvent('sign-detected', { detail: { sign: bestMatch } }));
        lastEventRef.current = now;
      }
    }
  }, [onSignDetected]);

  // ── Canvas Rendering ──
  const onResults = useCallback((results: any) => {
    if (!activeRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;

      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20]
      ];

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      connections.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
        ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
        ctx.stroke();
      });

      ctx.fillStyle = '#10b981';
      landmarks.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(point.x * w, point.y * h, 6, 0, 2 * Math.PI);
        ctx.fill();
      });

      predictSign(landmarks);
    } else {
      lastWristPosRef.current = null;

      const now = performance.now();
      if (now - lastUpdateRef.current > 200) {
        setCurrentSign('No hands detected');
        setConfidence(0);
        lastUpdateRef.current = now;
      }
    }
  }, [predictSign]);

  const onResultsRef = useRef(onResults);
  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

  // ── CPU-SAFE Camera Loop ──
  const processFrame = async () => {
    if (!activeRef.current || !videoRef.current || !handsRef.current) return;

    // 🚀 Double Lock: Engine must not be busy AND video frame must have updated
    if (!isProcessingRef.current && videoRef.current.readyState >= 2) {
      if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        isProcessingRef.current = true;
        try {
          await handsRef.current.send({ image: videoRef.current });
        } catch (err) {
        } finally {
          isProcessingRef.current = false;
        }
      }
    }
    requestRef.current = requestAnimationFrame(processFrame);
  };

  // ── Boot Sequence ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    activeRef.current = true;

    const bootEngine = async () => {
      try {
        setStatus('Waking up Camera...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve) => {
            videoRef.current!.onloadedmetadata = () => {
              videoRef.current!.play().then(() => {
                if (canvasRef.current && videoRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
                resolve();
              });
            };
          });
        }

        setStatus('Loading AI Models...');
        const hasCustomBrain = await loadTrainedBrain();

        await loadScript(MP_HANDS_URL);
        await new Promise(r => setTimeout(r, 500));

        const Hands = (window as any).Hands;
        if (!Hands) throw new Error('MediaPipe Failed to Load.');

        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MP_VERSION}/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        hands.onResults((results: any) => onResultsRef.current(results));
        handsRef.current = hands;

        setStatus(hasCustomBrain ? '✅ Custom Brain Active' : '✅ Rule-Based AI Active');
        requestRef.current = requestAnimationFrame(processFrame);

      } catch (err: any) {
        setError(err.message || 'Check camera permissions and internet connection.');
        setStatus('❌ Offline');
      }
    };

    bootEngine();

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      try { handsRef.current?.close(); } catch (_) { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrainedBrain]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 w-full h-full bg-slate-900 rounded-lg border border-red-600/50">
        <h2 className="text-lg font-black text-white w-full text-left">👁️ Vision Engine</h2>
        <div className="w-full flex-1 bg-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center">
          <span className="text-4xl mb-2">📷</span>
          <p className="font-bold text-red-400">Camera Failed</p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 w-full bg-slate-900">
      <div className="flex justify-between items-center text-white mb-4">
        <h2 className="text-lg font-black">👁️ Vision Engine</h2>
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${status.includes('Active') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
          {status}
        </span>
      </div>

      <div className="relative w-full aspect-[4/3] md:aspect-video bg-black rounded-xl overflow-hidden border border-slate-700">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          playsInline
          muted
          autoPlay
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-10"
        />
        {!status.includes('Active') && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
              <p className="text-xs text-slate-300 font-bold tracking-widest uppercase animate-pulse">{status}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Detected Gesture</p>
        <p className="text-3xl font-black text-white">{currentSign}</p>
        <div className="w-full bg-slate-900 h-2 mt-3 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInterpreter;
