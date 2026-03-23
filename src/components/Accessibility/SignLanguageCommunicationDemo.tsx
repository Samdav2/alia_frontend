'use client';

import React, { useState } from 'react';
import SignInterpreter from '@/components/Accessibility/SignInterpreter';
import SignAvatar from '@/components/Accessibility/SignAvatar';

/**
 * Two-Way Sign Language Communication Demo
 *
 * Left side: Vision Engine - user signs, computer recognizes
 * Right side: Avatar Engine - computer signs back
 */
export const SignLanguageCommunicationDemo: React.FC = () => {
  const [userSign, setUserSign] = useState<string>('');
  const [computerResponse, setComputerResponse] = useState<string>('hello');

  // Mapping of recognized signs to computer responses
  const signResponseMap: Record<string, string> = {
    'hello': 'hello',
    'thank you': 'youre welcome',
    'help': 'yes i can help',
    'goodbye': 'goodbye',
    'how are you': 'im doing great',
  };

  const handleSignRecognized = (sign: string) => {
    setUserSign(sign);
    // Automatically set computer response based on recognized sign
    setComputerResponse(signResponseMap[sign.toLowerCase()] || 'hello');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">
            Sign Language Communication System
          </h1>
          <p className="text-slate-400 text-lg">
            Two-way conversation: Users sign → AI recognizes → AI responds with sign
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Vision Engine */}
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-white mb-4">Your Sign</h2>
            <SignInterpreter onSignDetected={handleSignRecognized} />
            {userSign && (
              <div className="mt-6 w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
                <p className="text-slate-400 text-sm mb-2">You signed:</p>
                <p className="text-2xl font-black text-green-400">{userSign}</p>
              </div>
            )}
          </div>

          {/* Right: Avatar Engine */}
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-white mb-4">Digital Interpreter</h2>
            <SignAvatar textToSign={computerResponse} />
            <div className="mt-6 w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <p className="text-slate-400 text-sm mb-2">System response:</p>
              <p className="text-2xl font-black text-blue-400">{computerResponse}</p>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-2xl font-black text-white mb-6">How It Works</h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black text-white">
                1
              </div>
              <h4 className="text-lg font-black text-white">User Signs</h4>
              <p className="text-slate-400">
                Show your hands to the camera on the left. The vision engine tracks all 21 hand joints.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-black text-white">
                2
              </div>
              <h4 className="text-lg font-black text-white">AI Recognizes</h4>
              <p className="text-slate-400">
                TensorFlow.js model analyzes the hand positions and predicts which sign you made.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-black text-white">
                3
              </div>
              <h4 className="text-lg font-black text-white">Avatar Responds</h4>
              <p className="text-slate-400">
                The 3D avatar on the right signs back an appropriate response in sign language.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h4 className="text-lg font-black text-white mb-4">Technology Stack</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'MediaPipe', icon: '🎥' },
                { name: 'TensorFlow.js', icon: '🧠' },
                { name: 'Three.js', icon: '🎭' },
                { name: 'React Three Fiber', icon: '⚛️' },
              ].map((tech) => (
                <div key={tech.name} className="bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <p className="text-sm font-bold text-slate-300">{tech.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Try These Signs */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h4 className="text-lg font-black text-white mb-4">Try These Signs</h4>
            <p className="text-slate-400 mb-4">
              The system is currently trained to recognize these basic signs (when properly set up with your model):
            </p>
            <div className="flex flex-wrap gap-2">
              {['Hello', 'Thank You', 'Goodbye', 'Help', 'Yes', 'No', 'Love'].map((sign) => (
                <span
                  key={sign}
                  className="px-4 py-2 bg-slate-700 rounded-full text-sm font-bold text-slate-300 border border-slate-600"
                >
                  {sign}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-12 bg-amber-900/20 border border-amber-700 rounded-2xl p-8">
          <h3 className="text-xl font-black text-amber-200 mb-4">⚙️ Setup Required</h3>
          <p className="text-amber-100 mb-4">
            Before this system works at full capacity, you need to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-amber-100">
            <li>Train a sign recognition model on Google's Teachable Machine</li>
            <li>Place your trained model in: <code className="bg-black px-2 py-1 rounded">public/models/sign_recognition/</code></li>
            <li>Prepare a 3D avatar model (from Mixamo or ReadyPlayerMe)</li>
            <li>Animate the avatar for basic signs in Blender</li>
            <li>Place the avatar GLB file at: <code className="bg-black px-2 py-1 rounded">public/models/signing_avatar.glb</code></li>
          </ol>
          <p className="text-amber-100 mt-4">
            See <code className="bg-black px-2 py-1 rounded">SIGN_LANGUAGE_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageCommunicationDemo;
