'use client';

import React, { useState, useEffect } from 'react';
import { quizService, Quiz, QuizSubmission, QuizResults } from '@/services/api/quizService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';
import { ReadAloud } from '@/components/Accessibility/ReadAloud';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import BionicText from '@/components/Accessibility/BionicText';

interface QuizTakerProps {
  courseId: string;
  topicId: string;
  onComplete: (results: QuizResults) => void;
  onCancel: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ courseId, topicId, onComplete, onCancel }) => {
  const { showNotification } = useVisualNotification();
  const { bionicReading } = useUserPreferences();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (quiz && quiz.time_limit) {
      setTimeRemaining(quiz.time_limit * 60);
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quiz]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuiz(courseId, topicId);
      setQuiz(quizData);
    } catch (error) {
      showNotification('Failed to load quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const submitQuiz = async () => {
    if (submitting) return;
    
    const unanswered = quiz!.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeRemaining > 0) {
      showNotification(`You have ${unanswered} unanswered question(s)`, 'warning');
    }

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const submission: QuizSubmission = {
        quiz_id: quiz!.id,
        answers,
        time_taken: timeTaken
      };
      const results = await quizService.submitQuiz(courseId, topicId, submission);
      onComplete(results);
    } catch (error: any) {
      showNotification(error.response?.data?.detail || 'Failed to submit quiz', 'error');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-slate-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-slate-600">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="quiz-taker max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-black mb-2">
              {bionicReading ? <BionicText text={quiz.title} /> : quiz.title}
            </h2>
            <p className="text-blue-100">{quiz.description}</p>
          </div>
          <ReadAloud text={`${quiz.title}. ${quiz.description}`} />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <div className="text-xs text-blue-100">Questions</div>
            <div className="text-xl font-bold">{quiz.questions.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <div className="text-xs text-blue-100">Passing Score</div>
            <div className="text-xl font-bold">{quiz.passing_score}%</div>
          </div>
          {quiz.time_limit && (
            <div className={`bg-white/10 backdrop-blur-sm p-3 rounded-lg ${timeRemaining < 300 ? 'animate-pulse bg-red-500/30' : ''}`}>
              <div className="text-xs text-blue-100">Time Remaining</div>
              <div className="text-xl font-bold">{formatTime(timeRemaining)}</div>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg">
            <div className="text-xs text-blue-100">Progress</div>
            <div className="text-xl font-bold">{getAnsweredCount()} / {quiz.questions.length}</div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 mb-2">Question {index + 1}</div>
                <div className="text-lg font-semibold text-slate-900 mb-2">
                  {bionicReading ? <BionicText text={question.question} /> : question.question}
                </div>
                <div className="text-xs text-slate-500">{question.points} point(s)</div>
              </div>
              <ReadAloud text={`Question ${index + 1}. ${question.question}`} />
            </div>

            {/* Multiple Choice / True False */}
            {question.type !== 'short_answer' && question.options && (
              <div className="space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answers[question.id] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-5 h-5 text-blue-600 mr-3"
                    />
                    <span className="text-slate-900 font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {question.type === 'short_answer' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your answer here..."
                rows={3}
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 p-6 rounded-t-2xl shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {getAnsweredCount() < quiz.questions.length && (
              <span className="text-orange-600 font-bold">
                ⚠️ {quiz.questions.length - getAnsweredCount()} unanswered question(s)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitQuiz}
              disabled={submitting || getAnsweredCount() === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
