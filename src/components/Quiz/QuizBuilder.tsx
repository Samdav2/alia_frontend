'use client';

import React, { useState } from 'react';
import { lecturerService, CreateQuizData } from '@/services/api/lecturerService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';
import { ConfirmModal } from '@/components/Shared/ConfirmModal';
import { QuizOption, QuizQuestion } from '@/services/api/quizService';

interface QuizBuilderProps {
  topicId: string;
  existingQuiz?: any;
  onSave: (quizId: string) => void;
  onCancel: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ topicId, existingQuiz, onSave, onCancel }) => {
  const { showNotification } = useVisualNotification();
  const [title, setTitle] = useState(existingQuiz?.title || '');
  const [description, setDescription] = useState(existingQuiz?.description || '');
  const [timeLimit, setTimeLimit] = useState(existingQuiz?.time_limit || 30);
  const [passingScore, setPassingScore] = useState(existingQuiz?.passing_score || 70);
  const [maxAttempts, setMaxAttempts] = useState(existingQuiz?.max_attempts || 3);
  const [questions, setQuestions] = useState<QuizQuestion[]>(existingQuiz?.questions || []);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `q${Date.now()}`,
      question: '',
      type,
      options: type === 'true_false' 
        ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }]
        : type === 'multiple_choice'
        ? [{ id: 'a', text: '' }, { id: 'b', text: '' }]
        : undefined,
      correct_answer: '',
      explanation: '',
      points: 1.0
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options) {
      const nextId = String.fromCharCode(97 + question.options.length);
      question.options.push({ id: nextId, text: '' });
      setQuestions(updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options && question.options.length > 2) {
      question.options.splice(optionIndex, 1);
      setQuestions(updated);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
    const updated = [...questions];
    const question = updated[questionIndex];
    if (question.options) {
      question.options[optionIndex].text = text;
      setQuestions(updated);
    }
  };

  const saveQuiz = async () => {
    if (!title.trim()) {
      showNotification('Please provide a quiz title', 'error');
      return;
    }
    if (questions.length === 0) {
      showNotification('Please add at least one question', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        showNotification(`Question ${i + 1} is empty`, 'error');
        return;
      }
      if (!q.correct_answer) {
        showNotification(`Question ${i + 1} has no correct answer selected`, 'error');
        return;
      }
      if (q.options) {
        const emptyOption = q.options.find(opt => !opt.text.trim());
        if (emptyOption) {
          showNotification(`Question ${i + 1} has empty options`, 'error');
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Convert to backend format
      const quizData: CreateQuizData & { topic_id: string } = {
        title,
        description,
        time_limit: timeLimit,
        passing_score: passingScore,
        topic_id: topicId,
        questions: questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options?.map(o => o.text),
          correct_answer: q.correct_answer || '',
          points: q.points
        }))
      };

      const response = await lecturerService.createQuiz(quizData);
      showNotification('Quiz created successfully', 'success');
      onSave(response.id);
    } catch (error: any) {
      showNotification(error.response?.data?.detail || 'Failed to save quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="quiz-builder bg-white rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-900">Create Quiz</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        {/* Quiz Settings */}
        <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Quiz Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Python Basics Quiz"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the quiz"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Time Limit (min)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Passing Score (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Max Attempts</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={1}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <h4 className="text-lg font-bold text-slate-900">Questions ({questions.length})</h4>
          
          {questions.map((question, qIndex) => (
            <div key={question.id} className="border-2 border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Question {qIndex + 1}</span>
                <button
                  onClick={() => {
                    setQuestionToDelete(qIndex);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Question Text *</label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your question"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuizQuestion['type'];
                      updateQuestion(qIndex, {
                        type: newType,
                        options: newType === 'short_answer' ? undefined
                          : newType === 'true_false' ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }]
                          : [{ id: 'a', text: '' }, { id: 'b', text: '' }],
                        correct_answer: ''
                      });
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, { points: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={0.5}
                    step={0.5}
                  />
                </div>
              </div>

              {/* Options for multiple choice and true/false */}
              {question.options && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Options (select correct answer)</label>
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correct_answer === option.id}
                        onChange={() => updateQuestion(qIndex, { correct_answer: option.id })}
                        className="w-5 h-5 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        disabled={question.type === 'true_false'}
                      />
                      {question.type === 'multiple_choice' && question.options!.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-500 hover:text-red-700 text-xl px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {question.type === 'multiple_choice' && (
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Short answer correct answer */}
              {question.type === 'short_answer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Correct Answer *</label>
                  <input
                    type="text"
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, { correct_answer: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the correct answer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Explanation (shown after submission)</label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the correct answer"
                  rows={2}
                />
              </div>
            </div>
          ))}

          {/* Add Question Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => addQuestion('multiple_choice')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              + Multiple Choice
            </button>
            <button
              onClick={() => addQuestion('true_false')}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              + True/False
            </button>
            <button
              onClick={() => addQuestion('short_answer')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              + Short Answer
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-4 border-t border-slate-200">
          <button
            onClick={saveQuiz}
            disabled={saving}
            className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Quiz'}
          </button>
          <button
            onClick={onCancel}
            className="px-8 py-4 text-slate-500 hover:bg-slate-50 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Delete Question Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setQuestionToDelete(null);
        }}
        onConfirm={() => {
          if (questionToDelete !== null) {
            removeQuestion(questionToDelete);
          }
        }}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};
