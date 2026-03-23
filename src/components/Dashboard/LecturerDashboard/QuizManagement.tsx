'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CreateQuizData, QuizQuestion } from '@/services/api/lecturerService';
import { Course } from '@/services/api/courseService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

interface Quiz {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  topic_title: string;
  time_limit: number;
  passing_score: number;
  questions: QuizQuestion[];
  is_active: boolean;
  created_at: string;
}

export const QuizManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const { showNotification } = useVisualNotification();

  const [quizForm, setQuizForm] = useState<CreateQuizData & { topic_id: string }>({
    title: '',
    description: '',
    topic_id: '',
    time_limit: 30,
    passing_score: 70,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1
  });

  useEffect(() => {
    if (selectedCourse) {
      loadQuizzes(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getMyCourses({ page: 1, limit: 50 });
      setCourses(data.courses);
      if (data.courses.length > 0 && !selectedCourse) {
        setSelectedCourse(data.courses[0]);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizzes = async (courseId: string) => {
    try {
      const data = await lecturerService.getQuizzes({ course_id: courseId });
      setQuizzes(data);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizForm.questions.length === 0) {
      showNotification('Please add at least one question', 'error');
      return;
    }

    try {
      if (editingQuiz) {
        await lecturerService.updateQuiz(editingQuiz.id, quizForm);
        showNotification('Quiz updated successfully', 'success');
      } else {
        await lecturerService.createQuiz(quizForm);
        showNotification('Quiz created successfully', 'success');
      }

      setShowCreateModal(false);
      setEditingQuiz(null);
      resetQuizForm();
      if (selectedCourse) loadQuizzes(selectedCourse.id);
    } catch (err) {
      showNotification('Failed to save quiz', 'error');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await lecturerService.deleteQuiz(quizId);
      showNotification('Quiz deleted successfully', 'success');
      if (selectedCourse) loadQuizzes(selectedCourse.id);
    } catch (err) {
      showNotification('Failed to delete quiz', 'error');
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showNotification('Please enter a question', 'error');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options?.some(opt => !opt.trim())) {
      showNotification('Please fill in all answer options', 'error');
      return;
    }

    if (!currentQuestion.correct_answer.trim()) {
      showNotification('Please specify the correct answer', 'error');
      return;
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion
    };

    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, newQuestion]
    });

    // Reset current question
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1
    });
  };

  const removeQuestion = (index: number) => {
    setQuizForm({
      ...quizForm,
      questions: quizForm.questions.filter((_, i) => i !== index)
    });
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      topic_id: '',
      time_limit: 30,
      passing_score: 70,
      questions: []
    });
  };

  const openEditModal = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      topic_id: quiz.topic_id,
      time_limit: quiz.time_limit,
      passing_score: quiz.passing_score,
      questions: quiz.questions
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Quiz Management</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50 p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-inner">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Quiz Control Center</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Deploy and manage cognitive assessments</p>
        </div>
        <button
          onClick={() => {
            resetQuizForm();
            setEditingQuiz(null);
            setShowCreateModal(true);
          }}
          className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all hover-lift active:scale-95"
        >
          + Initialize New Assessment
        </button>
      </div>

      {/* Course Selector */}
      <div className="glass-card p-6 rounded-2xl">
        <label className="block text-sm font-bold text-slate-700 mb-2">Select Course</label>
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => {
            const course = courses.find(c => c.id === e.target.value);
            setSelectedCourse(course || null);
          }}
          className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No quizzes yet</h3>
            <p className="text-slate-600">Create your first quiz to assess student learning.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{quiz.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${quiz.is_active
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                      {quiz.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <p className="text-slate-600 mb-3">{quiz.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span>📚 {quiz.topic_title}</span>
                    <span>❓ {quiz.questions.length} questions</span>
                    <span>⏱️ {quiz.time_limit} minutes</span>
                    <span>🎯 {quiz.passing_score}% to pass</span>
                    <span>🔄 3 attempts</span>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                  <button
                    onClick={() => openEditModal(quiz)}
                    className="flex-1 lg:flex-none bg-slate-900 text-white px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-blue-600"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="flex-1 lg:flex-none bg-slate-100 text-slate-900 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-red-50 hover:text-red-600"
                  >
                    🗑️ Delete
                  </button>
                  <button className="w-full lg:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-green-600">
                    📊 Results
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h3>

            <form onSubmit={handleCreateQuiz} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Topic</label>
                  <select
                    value={quizForm.topic_id}
                    onChange={(e) => setQuizForm({ ...quizForm, topic_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Topic</option>
                    {/* Topics would be loaded based on selected course */}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={quizForm.time_limit}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-4">Questions ({quizForm.questions.length})</h4>

                {/* Existing Questions */}
                {quizForm.questions.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {quizForm.questions.map((question, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">Question {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{question.question}</p>
                        <div className="text-xs text-slate-500">
                          Type: {question.type} • Points: {question.points} • Correct: {question.correct_answer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Question */}
                <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg">
                  <h5 className="font-bold text-slate-900 mb-4">Add New Question</h5>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Question</label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Question Type</label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Points</label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Multiple Choice Options */}
                    {currentQuestion.type === 'multiple_choice' && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Answer Options</label>
                        <div className="space-y-2">
                          {currentQuestion.options?.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(currentQuestion.options || [])];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                              }}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Correct Answer</label>
                      <input
                        type="text"
                        value={currentQuestion.correct_answer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the correct answer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingQuiz(null);
                    resetQuizForm();
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  {editingQuiz ? 'Update' : 'Create'} Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
