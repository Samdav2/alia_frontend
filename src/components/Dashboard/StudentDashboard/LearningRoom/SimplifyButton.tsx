'use client';

import React, { useState } from 'react';
import { grokAIService } from '@/services/grokAIService';

interface SimplifyButtonProps {
  content?: string;
  courseId?: string;
  topicId?: string;
  // Legacy props for backwards compatibility
  onClick?: () => void;
  isLoading?: boolean;
  hasSummary?: boolean;
}

export const SimplifyButton: React.FC<SimplifyButtonProps> = ({
  content,
  courseId,
  topicId,
  onClick,
  isLoading: legacyIsLoading,
  hasSummary,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Use new Grok-based simplification if content provided, otherwise use legacy callback
  const handleSimplify = async () => {
    if (onClick) {
      // Legacy mode
      onClick();
      return;
    }

    if (!content || !courseId || !topicId) return;

    setIsLoading(true);
    try {
      // Use Grok AI to simplify content
      grokAIService.updateUserContext({
        currentCourse: courseId,
        completedTopics: [],
        learningGoals: ['understand', 'simplify'],
        preferences: {
          language: 'en',
          learningStyle: 'visual',
          difficulty: 'beginner'
        },
        performance: {
          averageScore: 0,
          timeSpent: 0,
          strugglingTopics: []
        }
      });

      const response = await grokAIService.generateAgenticResponse(
        `Please simplify and break down the following educational content into easier-to-understand language suitable for students. Use bullet points, short sentences, and simple terminology. Focus on key concepts and main ideas. Remove jargon and technical terms unless absolutely necessary (and explain them if used).\n\nContent:\n${content}`
      );

      setSimplifiedContent(response.response);
      setShowModal(true);
    } catch (error) {
      console.error('Error simplifying content:', error);
      alert('Could not simplify content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || legacyIsLoading;

  return (
    <>
      <button
        onClick={handleSimplify}
        disabled={loading}
        className={`fixed bottom-8 right-8 px-6 py-3 rounded-full shadow-lg transition-all ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600'
          } text-white disabled:opacity-50 z-40 ${hasSummary ? 'ring-2 ring-green-400' : ''}`}
        title="Simplify this topic with AI"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          {loading ? (
            <span className="animate-spin inline-block">⟳</span>
          ) : (
            <span className="font-bold">Simplify</span>
          )}
        </div>
      </button>

      {/* Simplified Content Modal */}
      {showModal && simplifiedContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-linear-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black">✨ Simplified Explanation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl hover:opacity-75 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                {simplifiedContent.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-slate-300 hover:bg-slate-400 rounded-lg font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
