'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUserPreferences } from '@/context/UserPreferencesContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'IDLE' | 'LOADING' | 'CALIBRATING' | 'READY' | 'ERROR';
interface Pos { x: number; y: number; }

// ── Advanced Tuning ───────────────────────────────────────────────────────────
const SENSITIVITY   = 3.5;    // Higher = less head movement needed to cross screen
const SCROLL_ZONE   = 0.15;   // Top/bottom 15% of screen triggers scroll
const SCROLL_AMT    = 90;
const SCROLL_DELAY  = 280;

// Dwell-to-click tuning
const DWELL_TIME_MS = 5000;   // 5 seconds to click
const DWELL_RADIUS  = 90;     // Wide forgiveness radius so you can relax your neck

const CALIBRATION_POINTS = [
  { id: 1, x: '50%', y: '50%', label: 'Center' },
  { id: 2, x: '15%', y: '15%', label: 'Top Left' },
  { id: 3, x: '85%', y: '15%', label: 'Top Right' },
  { id: 4, x: '15%', y: '85%', label: 'Bottom Left' },
  { id: 5, x: '85%', y: '85%', label: 'Bottom Right' },
];

const MP_FACE_MESH_URL  = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
const MP_CAMERA_URL     = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js';
const MP_DRAWING_URL    = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3/drawing_utils.js';

const NOSE_TIP_IDX = 1;

function loadScript(src: string, timeout = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    const t = setTimeout(() => reject(new Error(`Timeout: ${src}`)), timeout);
    s.onload  = () => { clearTimeout(t); resolve(); };
    s.onerror = () => { clearTimeout(t); reject(new Error(`Failed to load: ${src}`)); };
    document.head.appendChild(s);
  });
}

const GazeTrackerActivator: React.FC = () => {
  const { isGazeScrollActive } = useUserPreferences();

  const [status,           setStatus]          = useState<Status>('IDLE');
  const [statusMsg,        setStatusMsg]        = useState('');
  const [errorMsg,         setErrorMsg]         = useState<string | null>(null);
  const [cursorPos,        setCursorPos]        = useState<Pos | null>(null);
  const [scrollZone,       setScrollZone]       = useState<'top' | 'bottom' | null>(null);
  const [calibStep,        setCalibStep]        = useState(0);
  const [calibDone,        setCalibDone]        = useState(false);

  const [dwellProgress,    setDwellProgress]    = useState(0);
  const [clickRipple,      setClickRipple]      = useState<Pos | null>(null);

  const videoRef        = useRef<HTMLVideoElement | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const faceMeshRef     = useRef<any>(null);
  const cameraRef       = useRef<any>(null);
  const animFrameRef    = useRef<number>(0);
  const activeRef       = useRef(false);

  // Tracking Refs
  const smoothRef       = useRef<Pos>({ x: 0.5, y: 0.5 });
  const cooldownRef     = useRef(false);
  const vhRef           = useRef(typeof window !== 'undefined' ? window.innerHeight : 800);
  const vwRef           = useRef(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const dwellStartRef   = useRef<number>(0);
  const dwellAnchorRef  = useRef<Pos | null>(null);
  const hasClickedRef   = useRef<boolean>(false);

  const calibSamplesRef = useRef<Pos[][]>(CALIBRATION_POINTS.map(() => []));
  const mappingRef      = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const rawNoseRef      = useRef<Pos>({ x: 0.5, y: 0.5 });

  // ── Smart Sniper Smoothing ──────────────────────────────────────────────────
  const smooth = useCallback((nx: number, ny: number): Pos => {
    const p = smoothRef.current;

    // Calculate speed of head movement (distance between target and current)
    const dist = Math.hypot(nx - p.x, ny - p.y);

    let dynamicSmoothing = 0.25; // Default: Fast and snappy for moving around

    if (dist < 0.005) {
      // Sniper Deadzone: Head is barely moving. Lock it down to kill jitter completely.
      dynamicSmoothing = 0.01;
    } else if (dist < 0.02) {
      // Approaching target: Slow down smoothly
      dynamicSmoothing = 0.08;
    }

    const x = p.x + dynamicSmoothing * (nx - p.x);
    const y = p.y + dynamicSmoothing * (ny - p.y);

    smoothRef.current = { x, y };
    return { x, y };
  }, []);

  const doScroll = useCallback((sx: number, sy: number, delta: number) => {
    try {
      let el = document.elementFromPoint(sx, sy) as HTMLElement | null;
      while (el && el !== document.body) {
        const s = window.getComputedStyle(el);
        if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          el.scrollBy({ top: delta, behavior: 'smooth' }); return;
        }
        el = el.parentElement;
      }
      window.scrollBy({ top: delta, behavior: 'smooth' });
    } catch (_) {}
  }, []);

  const triggerClick = useCallback((x: number, y: number) => {
    try {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (el) {
        el.click();
        el.focus();
        setClickRipple({ x, y });
        setTimeout(() => setClickRipple(null), 500);
      }
    } catch (err) {
      console.error("Gaze click failed:", err);
    }
  }, []);

  // ── Fixed Screen Mapping Logic ─────────────────────────────────────────────
  const noseToScreen = useCallback((nx: number, ny: number): Pos => {
    const m = mappingRef.current;
    const vw = vwRef.current;
    const vh = vhRef.current;

    if (m) {
      // Calculate how far the nose has moved from the calibrated center
      const deltaX = (1 - nx) - m.offsetX; // (1 - nx) because camera is mirrored
      const deltaY = ny - m.offsetY;

      // Apply sensitivity and anchor to the EXACT center of the screen (vw / 2)
      let sx = (vw / 2) + (deltaX * SENSITIVITY * vw);
      let sy = (vh / 2) + (deltaY * SENSITIVITY * vh);

      // Clamp cursor so it doesn't fly off screen
      return {
        x: Math.max(0, Math.min(vw, sx)),
        y: Math.max(0, Math.min(vh, sy)),
      };
    }
    return { x: vw / 2, y: vh / 2 };
  }, []);

  const onResults = useCallback((results: any) => {
    if (!activeRef.current) return;
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

    const landmarks = results.multiFaceLandmarks[0];
    const nose = landmarks[NOSE_TIP_IDX];
    if (!nose) return;

    rawNoseRef.current = { x: nose.x, y: nose.y };

    if (calibDone) {
      const { x: sx, y: sy } = noseToScreen(nose.x, nose.y);
      const smoothed = smooth(sx / vwRef.current, sy / vhRef.current);
      const cx = smoothed.x * vwRef.current;
      const cy = smoothed.y * vhRef.current;

      setCursorPos({ x: cx, y: cy });

      // ── Dwell-to-click Logic ────────────────────────────────────────────────
      const now = performance.now();

      if (!dwellAnchorRef.current) {
        dwellAnchorRef.current = { x: cx, y: cy };
        dwellStartRef.current = now;
      }

      const dist = Math.hypot(cx - dwellAnchorRef.current.x, cy - dwellAnchorRef.current.y);

      if (dist < DWELL_RADIUS) {
        if (!hasClickedRef.current) {
          const elapsed = now - dwellStartRef.current;
          const progress = Math.min(1, elapsed / DWELL_TIME_MS);
          setDwellProgress(progress);

          if (progress >= 1) {
            triggerClick(cx, cy);
            hasClickedRef.current = true;
          }
        }
      } else {
        dwellAnchorRef.current = { x: cx, y: cy };
        dwellStartRef.current = now;
        hasClickedRef.current = false;
        setDwellProgress(0);
      }

      // ── Scroll Logic ────────────────────────────────────────────────────────
      if (cooldownRef.current) return;
      const vh = vhRef.current;
      if (cy <= vh * SCROLL_ZONE) {
        setScrollZone('top');
        cooldownRef.current = true;
        doScroll(cx, cy, -SCROLL_AMT);
        setTimeout(() => { cooldownRef.current = false; }, SCROLL_DELAY);
      } else if (cy >= vh * (1 - SCROLL_ZONE)) {
        setScrollZone('bottom');
        cooldownRef.current = true;
        doScroll(cx, cy, SCROLL_AMT);
        setTimeout(() => { cooldownRef.current = false; }, SCROLL_DELAY);
      } else {
        setScrollZone(null);
      }
    }
  }, [calibDone, noseToScreen, smooth, doScroll, triggerClick]);

  const onResultsRef = useRef(onResults);
  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);

  const SAMPLES_PER_POINT = 20; // Slightly faster calibration
  const recordingSamplesRef = useRef(false);

  const startRecordingForPoint = useCallback((pointIdx: number) => {
    recordingSamplesRef.current = true;
    calibSamplesRef.current[pointIdx] = [];

    const intervalId = setInterval(() => {
      if (!activeRef.current) { clearInterval(intervalId); return; }
      calibSamplesRef.current[pointIdx].push({ ...rawNoseRef.current });
      if (calibSamplesRef.current[pointIdx].length >= SAMPLES_PER_POINT) {
        clearInterval(intervalId);
        recordingSamplesRef.current = false;
      }
    }, 33);
  }, []);

  const handleCalibClick = useCallback((pointIdx: number) => {
    startRecordingForPoint(pointIdx);

    setTimeout(() => {
      const next = pointIdx + 1;
      if (next < CALIBRATION_POINTS.length) {
        setCalibStep(next);
      } else {
        // We really only need the precise Center point (Index 0) to anchor the math
        const centerSamples = calibSamplesRef.current[0];
        const avgX = centerSamples.reduce((s, p) => s + p.x, 0) / centerSamples.length;
        const avgY = centerSamples.reduce((s, p) => s + p.y, 0) / centerSamples.length;

        mappingRef.current = {
          offsetX: 1 - avgX, // Record the exact nose X at center (mirrored)
          offsetY: avgY,     // Record the exact nose Y at center
        };

        setCalibDone(true);
        setStatus('READY');
      }
    }, SAMPLES_PER_POINT * 33 + 200);
  }, [startRecordingForPoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    vhRef.current = window.innerHeight;
    vwRef.current = window.innerWidth;
    const onResize = () => { vhRef.current = window.innerHeight; vwRef.current = window.innerWidth; };
    window.addEventListener('resize', onResize);

    if (!isGazeScrollActive) {
      killAll();
      return () => window.removeEventListener('resize', onResize);
    }

    activeRef.current = true;
    let cleanedUp = false;

    const boot = async () => {
      try {
        setStatus('LOADING');
        setStatusMsg('Requesting camera access…');

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' },
            audio: false,
          });
        } catch (e: any) {
          throw new Error(
            e.name === 'NotAllowedError'
              ? 'Camera access denied. Please allow camera in your browser settings and try again.'
              : `Camera error: ${e.message}`
          );
        }

        if (cleanedUp) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        video.style.cssText = 'position:fixed;bottom:16px;left:16px;width:160px;height:120px;border-radius:12px;border:3px solid #3b82f6;z-index:9990;transform:scaleX(-1);object-fit:cover;';
        document.body.appendChild(video);
        videoRef.current = video;
        await video.play();

        setStatusMsg('Loading face tracking engine…');
        await loadScript(MP_DRAWING_URL);
        await loadScript(MP_FACE_MESH_URL);
        await loadScript(MP_CAMERA_URL);

        await new Promise(r => setTimeout(r, 800));

        if (cleanedUp) return;

        const FaceMesh = (window as any).FaceMesh;
        const Camera   = (window as any).Camera;

        if (!FaceMesh) throw new Error('MediaPipe FaceMesh failed to load. Check your internet connection.');

        setStatusMsg('Initialising face mesh…');
        const faceMesh = new FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.7, // Increased confidence for better stability
          minTrackingConfidence:  0.7,
        });

        faceMesh.onResults((results: any) => onResultsRef.current(results));
        faceMeshRef.current = faceMesh;

        if (Camera) {
          const camera = new Camera(video, {
            onFrame: async () => {
              if (activeRef.current && faceMeshRef.current) {
                await faceMeshRef.current.send({ image: video });
              }
            },
            width: 640, height: 480,
          });
          await camera.start();
          cameraRef.current = camera;
        } else {
          const loop = async () => {
            if (!activeRef.current) return;
            if (faceMeshRef.current && video.readyState >= 2) {
              await faceMeshRef.current.send({ image: video });
            }
            animFrameRef.current = requestAnimationFrame(loop);
          };
          animFrameRef.current = requestAnimationFrame(loop);
        }

        if (cleanedUp) return;

        video.style.display = 'block';
        setStatus('CALIBRATING');
        setCalibStep(0);
        setStatusMsg('');

      } catch (err: any) {
        console.error('[HeadTracker] Boot failed:', err);
        setErrorMsg(err?.message ?? 'Head tracking failed to start.');
        setStatus('ERROR');
      }
    };

    boot();

    return () => {
      cleanedUp = true;
      window.removeEventListener('resize', onResize);
      killAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGazeScrollActive]);

  function killAll() {
    activeRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
    try { cameraRef.current?.stop(); }   catch (_) {}
    try { faceMeshRef.current?.close(); } catch (_) {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    videoRef.current?.remove();
    videoRef.current = null;
    faceMeshRef.current = null;
    cameraRef.current = null;
    setCursorPos(null);
    setScrollZone(null);
    setStatus('IDLE');
    setCalibStep(0);
    setCalibDone(false);
    setDwellProgress(0);
    mappingRef.current = null;
    calibSamplesRef.current = CALIBRATION_POINTS.map(() => []);
  }

  if (!isGazeScrollActive) return null;

  const calibProgress = (calibStep / CALIBRATION_POINTS.length) * 100;
  const currentPoint  = CALIBRATION_POINTS[calibStep];

  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (dwellProgress * ringCircumference);

  return (
    <>
      {cursorPos && status === 'READY' && (
        <div style={{
          position: 'fixed',
          left: cursorPos.x, top: cursorPos.y,
          width: 50, height: 50,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
          zIndex: 2147483647,
          transition: 'left 40ms linear, top 40ms linear',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dwellProgress > 0 && (
            <svg width="50" height="50" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle
                cx="25" cy="25" r={ringRadius}
                fill="none"
                stroke="rgba(59,130,246,0.8)"
                strokeWidth="4"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 100ms linear' }}
              />
            </svg>
          )}

          <div style={{
            width: 12, height: 12,
            background: dwellProgress === 1 ? '#10b981' : '#3b82f6',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(59,130,246,0.5)',
            transition: 'background-color 0.2s ease',
          }} />
        </div>
      )}

      {clickRipple && (
        <div style={{
          position: 'fixed',
          left: clickRipple.x, top: clickRipple.y,
          width: 80, height: 80,
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          border: '4px solid #10b981',
          pointerEvents: 'none',
          zIndex: 2147483646,
          animation: 'ping 0.6s cubic-bezier(0, 0, 0.2, 1) forwards',
        }} />
      )}

      {status === 'LOADING' && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-2xl flex items-center justify-center">
          <div className="bg-white rounded-[36px] p-10 text-center shadow-2xl max-w-xs">
            <div className="text-5xl mb-4 animate-pulse">🧠</div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Loading Head Tracker</h2>
            <p className="text-slate-500 text-sm mb-4">{statusMsg}</p>
          </div>
        </div>
      )}

      {status === 'CALIBRATING' && currentPoint && (
        <div className="fixed inset-0 z-[9998] bg-white/90 backdrop-blur-sm">
          <div className="absolute top-0 inset-x-0 h-1 bg-slate-100">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${calibProgress}%` }} />
          </div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Calibrate Head Tracking</h2>
            <p className="text-slate-500 text-sm">Move your head to align with the dot, then <strong>click it</strong></p>
          </div>
          <button
            onClick={() => handleCalibClick(calibStep)}
            style={{ top: currentPoint.y, left: currentPoint.x, position: 'absolute' }}
            className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 hover:scale-110 active:scale-90 transition-all duration-150"
          >
            <div className="w-16 h-16 rounded-full bg-blue-600 border-4 border-blue-300 animate-pulse" />
          </button>
        </div>
      )}
    </>
  );
};

export default GazeTrackerActivator;
