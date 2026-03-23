'use client';

import React from 'react';
import { QuizResults as QuizResultsType } from '@/services/api/quizService';
import { ReadAloud } from '@/components/Accessibility/ReadAloud';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import BionicText from '@/components/Accessibility/BionicText';

interface QuizResultsProps {
  results: QuizResultsType;
  onRetake?: () => void;
  onContinue?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ results, onRetake, onContinue }) => {
  const { bionicReading } = useUserPreferences();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = () => {
    if (results.score >= 90) return 'from-green-500 to-emerald-600';
    if (results.score >= 70) return 'from-blue-500 to-cyan-600';
    if (results.score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="quiz-results max-w-4xl mx-auto">
      {/* Score Summary */}
      <div className={`bg-gradient-to-r ${getScoreColor()} text-white p-8 rounded-2xl mb-6 text-center`}>
        <div className="mb-4">
          <div className="text-6xl font-black mb-2">{results.score.toFixed(1)}%</div>
          <div className="text-2xl font-bold">
            {results.passed ? '🎉 Passed!' : '📚 Keep Learning'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-xs text-white/80">Correct Answers</div>
            <div className="text-2xl font-bold">{results.correct_answers} / {results.total_questions}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-xs text-white/80">Time Taken</div>
            <div className="text-2xl font-bold">{formatTime(results.time_taken)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg col-span-2 md:col-span-1">
            <div className="text-xs text-white/80">Status</div>
            <div className="text-2xl font-bold">{results.passed ? '✓' : '✗'}</div>
          </div>
        </div>
      </div>

      {/* Question Feedback */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Question Review</h3>
          <ReadAloud text={`Quiz completed. Your score is ${results.score.toFixed(1)} percent. ${results.passed ? 'You passed!' : 'You did not pass.'}`} />
        </div>
        
        {results.feedback.map((item, index) => (
          <div
            key={item.question_id}
            className={`border-l-4 rounded-xl p-6 ${
              item.correct
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 mb-1">Question {index + 1}</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  item.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {item.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              <ReadAloud text={`Question ${index + 1}. ${item.correct ? 'Correct' : 'Incorrect'}`} />
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-xs font-bold text-slate-500 mb-1">Your Answer:</div>
                <div className={`font-semibold ${item.correct ? 'text-green-700' : 'text-red-700'}`}>
                  {bionicReading ? <BionicText text={item.your_answer} /> : item.your_answer}
                </div>
              </div>

              {!item.correct && (
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-xs font-bold text-slate-500 mb-1">Correct Answer:</div>
                  <div className="font-semibold text-green-700">
                    {bionicReading ? <BionicText text={item.correct_answer} /> : item.correct_answer}
                  </div>
                </div>
              )}

              {item.explanation && (
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="text-xs font-bold text-slate-500 mb-1">💡 Explanation:</div>
                  <p className="text-slate-700">
                    {bionicReading ? <BionicText text={item.explanation} /> : item.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {!results.passed && onRetake && (
          <button
            onClick={onRetake}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
          >
            🔄 Retake Quiz
          </button>
        )}
        {onContinue && (
          <button
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
          >
            Continue Learning →
          </button>
        )}
      </div>
    </div>
  );
};
