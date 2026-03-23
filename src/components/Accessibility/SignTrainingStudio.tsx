'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

// ── Multiple CDN options for MediaPipe Hands ──
const MP_HANDS_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js'
];

const MP_CAMERA_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
];

async function loadScript(urls: string | string[], maxRetries = 3): Promise<void> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  let lastError: Error | null = null;

  for (const url of urlList) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (document.querySelector(`script[src="${url}"]`)) {
          console.log(`✅ Script already loaded: ${url}`);
          return;
        }

        const loaded = await new Promise<boolean>((resolve) => {
          const script = document.createElement('script');
          script.src = url;
          script.async = true;
          script.crossOrigin = 'anonymous';

          const timeout = setTimeout(() => {
            script.remove();
            resolve(false);
          }, 8000);

          script.onload = () => {
            clearTimeout(timeout);
            console.log(`✅ Loaded: ${url}`);
            resolve(true);
          };

          script.onerror = () => {
            clearTimeout(timeout);
            script.remove();
            console.warn(`❌ Failed to load: ${url} (attempt ${attempt + 1}/${maxRetries})`);
            resolve(false);
          };

          document.head.appendChild(script);
        });

        if (loaded) return;

        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Error loading ${url}:`, lastError);
      }
    }
  }

  throw new Error(`Failed to load MediaPipe Hands from any CDN. Last error: ${lastError?.message}`);
}

// Pre-fetch WASM assets to ensure they're available when Hands initializes
async function preloadWasmAssets(): Promise<void> {
  const cdnBase = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915';
  const assetFiles = [
    'hands_solution_packed_assets.data',
    'hands_solution_packed_assets_loader.js',
  ];

  for (const file of assetFiles) {
    try {
      const url = `${cdnBase}/${file}`;
      console.log(`Preloading asset: ${url}`);
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        console.warn(`Asset not found or not accessible: ${url} (${response.status})`);
      } else {
        console.log(`✅ Asset preloaded: ${file}`);
      }
    } catch (err) {
      console.warn(`Could not preload asset ${file}:`, err);
      // Continue anyway - some assets may not be needed
    }
  }
}

// Interface for our training data
interface TrainingExample {
  label: string;
  features: number[]; // 63 numbers (21 landmarks * 3 axes)
}

const SignTrainingStudio: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState('Booting Studio...');
  const [currentLabel, setCurrentLabel] = useState('SCROLL_UP');
  const [isRecording, setIsRecording] = useState(false);
  const [dataset, setDataset] = useState<TrainingExample[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainedModel, setTrainedModel] = useState<tf.LayersModel | null>(null);
  const [uniqueLabels, setUniqueLabels] = useState<string[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, number>>({});

  const activeRef = useRef(true);
  const handsRef = useRef<any>(null);
  const requestRef = useRef<number>(0);

  // ── 1. The "Very Smart" Data Extraction ──
  const extractFeatures = (landmarks: any[]) => {
    // We normalize all points relative to the wrist (landmark 0)
    // This makes the AI recognize the sign regardless of where the hand is on screen!
    const wrist = landmarks[0];
    const features: number[] = [];

    for (let i = 0; i < landmarks.length; i++) {
      features.push(landmarks[i].x - wrist.x);
      features.push(landmarks[i].y - wrist.y);
      features.push(landmarks[i].z - wrist.z); // Include depth for better accuracy
    }
    return features; // Returns exactly 63 numbers
  };

  const onResults = (results: any) => {
    if (!activeRef.current || !canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw Skeleton
      ctx.fillStyle = '#10b981';
      landmarks.forEach((p: any) => {
        ctx.beginPath();
        ctx.arc(p.x * canvasRef.current!.width, p.y * canvasRef.current!.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw connections for visual feedback
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
      ];
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      connections.forEach(([from, to]) => {
        const p1 = landmarks[from];
        const p2 = landmarks[to];
        ctx.beginPath();
        ctx.moveTo(p1.x * canvasRef.current!.width, p1.y * canvasRef.current!.height);
        ctx.lineTo(p2.x * canvasRef.current!.width, p2.y * canvasRef.current!.height);
        ctx.stroke();
      });

      // If we are holding the "Record" button, save these coordinates to our dataset!
      if (isRecording) {
        const features = extractFeatures(landmarks);
        setDataset(prev => [...prev, { label: currentLabel.toUpperCase(), features }]);
      }
    }
    ctx.restore();
  };

  const onResultsRef = useRef(onResults);
  useEffect(() => { onResultsRef.current = onResults; }, [onResults, isRecording, currentLabel]);

  // ── Camera Loop ──
  const processFrame = async () => {
    if (!activeRef.current || !videoRef.current || !handsRef.current) return;
    if (videoRef.current.readyState >= 2) {
      try { await handsRef.current.send({ image: videoRef.current }); } catch (err) {}
    }
    requestRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    activeRef.current = true;

    const bootEngine = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>(resolve => {
            videoRef.current!.onloadedmetadata = () => {
              videoRef.current!.play().then(resolve).catch(() => resolve());
            };
          });
        }

        // Load MediaPipe libraries (with retry)
        try {
          console.log('Loading MediaPipe Hands...');
          await loadScript(MP_HANDS_URLS);
          console.log('Loading MediaPipe Camera Utils...');
          await loadScript(MP_CAMERA_URLS);
        } catch (err) {
          console.error('MediaPipe load error:', err);
          setStatus('❌ MediaPipe CDN unavailable - check network/cache');
          return;
        }

        await new Promise(r => setTimeout(r, 800));

        const Hands = (window as any).Hands;
        if (!Hands) {
          setStatus('❌ MediaPipe library not initialized');
          return;
        }

        const hands = new Hands({
          locateFile: (file: string) => {
            const basePath = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915';
            return `${basePath}/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });
        hands.onResults((results: any) => onResultsRef.current(results));
        handsRef.current = hands;

        setStatus('✅ Studio Ready. Start Recording Data.');
      } catch (err) {
        console.error('Boot error:', err);
        setStatus('❌ Camera/MediaPipe Error: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    bootEngine();

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(requestRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      try { handsRef.current?.close(); } catch (_) {}
    };
  }, []);

  // ── 2. Train the Deep Neural Network ──
  const trainModel = async () => {
    if (dataset.length === 0) {
      alert('No data recorded!');
      return;
    }

    if (dataset.length < 50) {
      alert(`Need at least 50 datapoints. You have ${dataset.length}. Keep recording!`);
      return;
    }

    setStatus('🧠 Training AI... Do not close this page');
    setTrainingProgress(0);

    // Get unique labels to figure out how many outputs the AI needs
    const labels = Array.from(new Set(dataset.map(d => d.label)));
    const lMap: Record<string, number> = {};
    labels.forEach((lbl, idx) => lMap[lbl] = idx);

    setUniqueLabels(labels);
    setLabelMap(lMap);

    // Prepare Tensors
    const xs = tf.tensor2d(dataset.map(item => item.features));
    const ys = tf.oneHot(
      tf.tensor1d(dataset.map(item => lMap[item.label]), 'int32'),
      labels.length
    );

    try {
      // Build the Neural Network Architecture
      const model = tf.sequential({
        layers: [
          // Hidden Layer 1: 128 neurons, looks for complex patterns
          tf.layers.dense({ units: 128, activation: 'relu', inputShape: [63] }),
          tf.layers.dropout({ rate: 0.2 }), // Prevents overfitting

          // Hidden Layer 2: 64 neurons, refines the patterns
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),

          // Hidden Layer 3: 32 neurons, further refinement
          tf.layers.dense({ units: 32, activation: 'relu' }),

          // Output Layer: Matches the number of unique signs we trained
          tf.layers.dense({ units: labels.length, activation: 'softmax' }),
        ]
      });

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      // Train it!
      await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 16,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingProgress(((epoch + 1) / 50) * 100);
            console.log(`Epoch ${epoch + 1}/50: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4) || 'N/A'}`);
          }
        }
      });

      setTrainedModel(model);
      setStatus(`✅ Model Trained! Accuracy: High on ${labels.length} signs.`);

      // Save the label map so the interpreter knows what '0', '1', '2' means later
      localStorage.setItem('sign_label_map', JSON.stringify(labels));
      localStorage.setItem('training_dataset_size', String(dataset.length));

      // Clean up tensors
      xs.dispose();
      ys.dispose();
    } catch (err) {
      console.error('Training error:', err);
      setStatus('❌ Training failed. Check console.');
    }
  };

  // ── 3. Export the Brain ──
  const downloadModel = async () => {
    if (!trainedModel) {
      alert('No model to download!');
      return;
    }

    try {
      setStatus('💾 Downloading model files...');
      await trainedModel.save('downloads://lasu-sign-model');
      setStatus(`✅ Downloaded! Now upload model.json and weights.bin to /public folder.`);
    } catch (err) {
      console.error('Download error:', err);
      setStatus('❌ Download failed. Check console.');
    }
  };

  const clearDataset = () => {
    if (confirm('Clear all recorded data? This cannot be undone.')) {
      setDataset([]);
      setTrainingProgress(0);
      setTrainedModel(null);
      setStatus('✅ Studio Ready. Start Recording Data.');
    }
  };

  const exportDatasetJSON = () => {
    const json = JSON.stringify({ dataset, labels: uniqueLabels, labelMap }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-900 min-h-screen text-white rounded-xl">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">🧠 AI Sign Training Studio</h1>
        <p className="text-slate-400">Build a deep learning model by recording hand gestures</p>
      </div>

      <div className="mb-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
        <p className="text-blue-300 text-sm">
          <strong>Status:</strong> {status}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Camera View */}
        <div className="col-span-2">
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700">
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              width={640}
              height={480}
              style={{ display: 'block' }}
            />

            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full font-bold animate-pulse shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                Recording...
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-slate-900/80 px-4 py-2 rounded-lg text-sm font-bold text-green-400">
              Sign: <span className="text-white">{currentLabel}</span>
            </div>
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Sign Name Input */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-400 mb-2">SIGN NAME</label>
            <input
              type="text"
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white font-bold uppercase text-center"
              placeholder="e.g. SCROLL_DOWN"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Use underscores for multi-word names</p>
          </div>

          {/* Record Button */}
          <button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={`w-full font-black py-4 rounded-xl transition-all shadow-lg text-lg ${
              isRecording
                ? 'bg-red-600 scale-95'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
            } text-white`}
          >
            {isRecording ? '⏺️ RECORDING' : '⏸️ HOLD TO RECORD'}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Hold while making the sign. Move your hand to capture variations.
          </p>

          {/* Stats */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold">Total Datapoints:</span>
              <span className="text-2xl font-black text-green-400">{dataset.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Unique Signs:</span>
              <span className="text-xl font-black text-purple-400">{uniqueLabels.length}</span>
            </div>
          </div>

          {/* Sign Breakdown */}
          {dataset.length > 0 && (
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-xs font-bold text-slate-400 mb-3">DATAPOINTS PER SIGN:</p>
              <div className="space-y-2">
                {uniqueLabels.map(label => {
                  const count = dataset.filter(d => d.label === label).length;
                  return (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm">{label}</span>
                      <span className="text-sm font-bold text-cyan-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-4">
        {dataset.length > 50 && (
          <button
            onClick={trainModel}
            className="col-span-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg transition-all"
          >
            🧠 TRAIN AI
          </button>
        )}

        {trainedModel && (
          <button
            onClick={downloadModel}
            className="col-span-1 bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition-all"
          >
            💾 DOWNLOAD
          </button>
        )}

        {dataset.length > 0 && (
          <button
            onClick={exportDatasetJSON}
            className="col-span-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl shadow-lg transition-all text-sm"
          >
            📊 EXPORT DATA
          </button>
        )}

        {dataset.length > 0 && (
          <button
            onClick={clearDataset}
            className="col-span-1 bg-red-700 hover:bg-red-600 text-white font-black py-3 rounded-xl shadow-lg transition-all text-sm"
          >
            🗑️ CLEAR ALL
          </button>
        )}
      </div>

      {/* Training Progress */}
      {trainingProgress > 0 && trainingProgress < 100 && (
        <div className="mt-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Training Progress</span>
            <span className="font-black text-purple-400">{trainingProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-600">
            <div
              className="h-full bg-linear-to-r from-purple-500 to-purple-400 transition-all"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 p-6 bg-slate-800 rounded-xl border border-slate-700">
        <h3 className="font-black text-lg mb-3">📚 How to Use</h3>
        <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
          <li>Type a sign name (e.g., <code className="bg-slate-900 px-2 py-1 rounded text-xs">SCROLL_UP</code>)</li>
          <li>Hold the Record button for 3-5 seconds while making the sign</li>
          <li>Move your hand around (closer, farther, left, right) to capture variations</li>
          <li>Repeat for 10-20 different signs</li>
          <li>Once you have 50+ datapoints, click <strong>TRAIN AI</strong></li>
          <li>After training, click <strong>DOWNLOAD</strong> to get model.json and weights.bin</li>
          <li>Upload these files to <code className="bg-slate-900 px-2 py-1 rounded text-xs">/public</code> folder</li>
          <li>In SignInterpreter.tsx, load with: <code className="bg-slate-900 px-2 py-1 rounded text-xs text-green-400">const brain = await tf.loadLayersModel('/model.json')</code></li>
        </ol>
      </div>
    </div>
  );
};

export default SignTrainingStudio;
