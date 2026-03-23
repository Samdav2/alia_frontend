'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, CreateCourseData, CreateModuleData, CreateTopicData, FileUploadResponse } from '@/services/api/lecturerService';
import { Course, Module, Topic, CourseDetails, courseService } from '@/services/api/courseService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';
import { FileUploadManager, FileCounter } from './FileUpload';
import { RichTextEditor } from '@/components/Shared/RichTextEditor';
import { QuizBuilder } from '@/components/Quiz/QuizBuilder';
import { ConfirmModal } from '@/components/Shared/ConfirmModal';
import '@/styles/editor.css';

interface CourseBuilderProps {
  initialCourseId?: string | null;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ initialCourseId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<(Module & { topics: Topic[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [editorView, setEditorView] = useState<'list' | 'module_form' | 'topic_form'>('list');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [showDeleteTopicConfirm, setShowDeleteTopicConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<{ topicId: string; title: string } | null>(null);
  const { showNotification } = useVisualNotification();

  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    code: '',
    title: '',
    description: '',
    department: '',
    level: 'beginner',
    duration: '',
    tags: []
  });

  const [moduleForm, setModuleForm] = useState<CreateModuleData>({
    title: '',
    description: '',
    order: 1,
    duration: ''
  });

  const [topicForm, setTopicForm] = useState<CreateTopicData>({
    title: '',
    description: '',
    content: '',
    content_type: 'text',
    order: 1,
    duration: '30', // Changed from number to string
    resources: []
  });

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (initialCourseId && courses.length > 0) {
      const course = courses.find(c => c.id === initialCourseId);
      if (course) {
        setSelectedCourse(course);
        loadCourseModules(course.id);
      }
    }
  }, [initialCourseId, courses]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await lecturerService.getMyCourses({ page: 1, limit: 50 });
      setCourses(data.courses);
    } catch (err) {
      console.error('Error loading courses:', err);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseModules = async (courseId: string) => {
    try {
      const details = await courseService.getCourseDetails(courseId);
      setModules(details.modules || []);
    } catch (err) {
      console.error('Error loading modules:', err);
      showNotification('Failed to load course content', 'error');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lecturerService.createCourse(courseForm);
      showNotification('Course created successfully', 'success');
      setShowCreateCourseModal(false);
      resetCourseForm();
      loadMyCourses();
    } catch (err) {
      showNotification('Failed to create course', 'error');
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await lecturerService.createModule(selectedCourse.id, moduleForm);
      showNotification('Module created successfully', 'success');
      setEditorView('list');
      resetModuleForm();
      loadCourseModules(selectedCourse.id);
    } catch (err) {
      showNotification('Failed to create module', 'error');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      await lecturerService.createTopic(selectedModule.id, topicForm);
      showNotification('Topic created successfully', 'success');
      setEditorView('list');
      resetTopicForm();
      loadCourseModules(selectedCourse!.id);
    } catch (err) {
      showNotification('Failed to create topic', 'error');
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      await lecturerService.publishCourse(courseId);
      showNotification('Course published successfully', 'success');
      loadMyCourses();
    } catch (err) {
      showNotification('Failed to publish course', 'error');
    }
  };

  const handleEditTopic = (topic: Topic, module: Module) => {
    setEditingTopic(topic);
    setSelectedModule(module);
    setTopicForm({
      title: topic.title,
      description: topic.description,
      content: topic.content || '',
      content_type: topic.content_type || 'text',
      order: topic.order || 1,
      duration: topic.duration?.toString() || '30 mins',
      resources: topic.resources || []
    });
    setEditorView('topic_form');
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;

    try {
      await lecturerService.updateTopic(editingTopic.id, topicForm);
      showNotification('Topic updated successfully', 'success');
      setEditorView('list');
      setEditingTopic(null);
      resetTopicForm();
      if (selectedCourse) {
        loadCourseModules(selectedCourse.id);
      }
    } catch (err) {
      showNotification('Failed to update topic', 'error');
    }
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;

    try {
      await lecturerService.deleteTopic(topicToDelete.topicId);
      showNotification('Topic deleted successfully', 'success');
      setShowDeleteTopicConfirm(false);
      setTopicToDelete(null);
      if (selectedCourse) {
        loadCourseModules(selectedCourse.id);
      }
    } catch (err) {
      showNotification('Failed to delete topic', 'error');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      title: '',
      description: '',
      department: '',
      level: 'beginner',
      duration: '',
      tags: []
    });
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      description: '',
      order: 1,
      duration: ''
    });
  };

  const resetTopicForm = () => {
    setTopicForm({
      title: '',
      description: '',
      content: '',
      content_type: 'text',
      order: 1,
      duration: '30 mins',
      resources: []
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      published: 'bg-green-100 text-green-800 border-green-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Course Builder</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl animate-pulse border border-gray-200">
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
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
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Course Architect</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-1">Design and deploy your digital curriculum</p>
      </div>
      <button
        onClick={() => setShowCreateCourseModal(true)}
        className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl hover:bg-slate-800 transition-all hover-lift active:scale-95"
      >
        + Initialize New Course
      </button>
    </div>

    {/* Course Selection */}
    {!selectedCourse ? (
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Your Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full glass-card p-12 rounded-[40px] text-center border-dashed border-2 border-slate-200">
              <div className="text-8xl mb-6">🏗️</div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready to Build?</h3>
              <p className="text-slate-500 font-bold max-w-lg mx-auto mb-8">Select a course below or create a new one to start architecting your curriculum with modules and interactive topics.</p>
              <button
                onClick={() => setShowCreateCourseModal(true)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
              >
                Launch New Project
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedCourse(course);
                  loadCourseModules(course.id);
                }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{course.title}</h4>
                    <p className="text-sm text-slate-600">{course.code}</p>
                  </div>
                  {getStatusBadge((course as any).status || 'draft')}
                </div>

                <p className="text-sm text-slate-700 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📊 {(course as any).enrollments || 0} students</span>
                    <span>⏱️ {course.duration}</span>
                  </div>

                  {(course as any).status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishCourse(course.id);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    ) : (
      /* Course Content Builder */
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-blue-600 hover:text-blue-700 font-bold"
          >
            ← Back to Courses
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{selectedCourse.title}</h3>
            <p className="text-sm text-slate-600">{selectedCourse.code}</p>
          </div>
        </div>

        {/* Enhanced File Upload Manager */}
        <FileUploadManager
          context={{
            type: 'course',
            courseId: selectedCourse.id
          }}
          showReadAloud={true} // Enable read-aloud for lecturers to preview content
          onFileUpload={(file) => {
            console.log('File uploaded:', file);
            // You can add the file to topic resources if needed
            if (editorView === 'topic_form' && file) {
              const newResource = {
                type: file.type,
                url: file.url,
                title: file.original_filename
              };
              setTopicForm(prev => ({
                ...prev,
                resources: [...(prev.resources || []), newResource]
              }));
            }
          }}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules / Editor Workspace */}
          <div className="lg:col-span-2">
            {editorView === 'list' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-slate-900">Course Modules</h4>
                  <button
                    onClick={() => setEditorView('module_form')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                  >
                    + Add Module
                  </button>
                </div>

                <div className="space-y-4">
                  {modules.length === 0 ? (
                    <div className="glass-card p-8 rounded-2xl text-center">
                      <div className="text-4xl mb-3">📖</div>
                      <h4 className="font-bold text-slate-900 mb-2">No modules yet</h4>
                      <p className="text-sm text-slate-600">Add your first module to structure your course.</p>
                    </div>
                  ) : (
                    modules.map((module, index) => (
                      <div key={module.id} className="glass-card p-6 rounded-2xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-bold text-slate-900">Module {index + 1}: {module.title}</h5>
                            <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedModule(module);
                              setEditorView('topic_form');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                          >
                            + Topic
                          </button>
                        </div>

                        {/* Topics List */}
                        <div className="mt-4 space-y-2">
                          {module.topics?.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-2">No topics in this module.</div>
                          ) : (
                            module.topics?.map((topic, tIndex) => (
                              <div key={topic.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group/topic">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-400">{index + 1}.{tIndex + 1}</span>
                                  <span className="text-sm font-semibold text-slate-700">{topic.title}</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setSelectedTopic(topic);
                                      setShowQuizBuilder(true);
                                    }}
                                    className="text-purple-600 hover:text-purple-800 text-xs font-bold"
                                    title="Add/Edit Quiz"
                                  >
                                    📝 Quiz
                                  </button>
                                  <button 
                                    onClick={() => {
                                      // Show topic file manager
                                      setSelectedModule(module);
                                      setEditorView('topic_form');
                                    }}
                                    className="text-green-600 hover:text-green-800 text-xs font-bold"
                                    title="Manage topic files"
                                  >
                                    📁
                                  </button>
                                  <button 
                                    onClick={() => handleEditTopic(topic, module)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                                    title="Edit topic"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setTopicToDelete({ topicId: topic.id, title: topic.title });
                                      setShowDeleteTopicConfirm(true);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-xs font-bold"
                                    title="Delete topic"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                <div className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex gap-4">
                    <span>Topics: {module.topics?.length || 0}</span>
                    <span>Duration: {module.duration}</span>
                    <FileCounter 
                      context={{
                        type: 'module',
                        courseId: selectedCourse?.id,
                        moduleId: module.id
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-slate-600">Reorder</button>
                    <button className="text-slate-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {editorView === 'module_form' && (
              <div className="glass-card p-8 rounded-[32px] animate-fade-in border-blue-100 shadow-blue-500/5">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Course Module</h3>
                  <button onClick={() => setEditorView('list')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    ✕ Close
                  </button>
                </div>
                <form onSubmit={handleCreateModule} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Module Title</label>
                    <input
                      type="text"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                      placeholder="e.g., Fundamentals of AI"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold h-32"
                      placeholder="What will this module cover?"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Duration</label>
                      <input
                        type="text"
                        value={moduleForm.duration}
                        onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                        placeholder="e.g., 2 weeks"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Order Index</label>
                      <input
                        type="number"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-600 transition-all"
                    >
                      Create Module
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorView('list')}
                      className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {editorView === 'topic_form' && (
              <div className="glass-card p-8 rounded-[32px] animate-fade-in border-green-100 shadow-green-500/5">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {editingTopic ? 'Edit Topic' : 'Add Topic'}
                    </h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">MODULE: {selectedModule?.title}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditorView('list');
                      setEditingTopic(null);
                      resetTopicForm();
                    }} 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                <form onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Topic Title</label>
                    <input
                      type="text"
                      value={topicForm.title}
                      onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border text-slate-900 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                      placeholder="e.g., Neural Networks Overview"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Content Type</label>
                      <select
                        value={topicForm.content_type}
                        onChange={(e) => setTopicForm({ ...topicForm, content_type: e.target.value as any })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                      >
                        <option value="text">Text / Article</option>
                        <option value="video">Video Lecture</option>
                        <option value="quiz">Interactive Quiz</option>
                        <option value="interactive">Simulation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Est. Duration</label>
                      <input
                        type="text"
                        value={topicForm.duration}
                        onChange={(e) => setTopicForm({ ...topicForm, duration: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border text-slate-900 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                        placeholder="e.g., 30 mins"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
                    <textarea
                      value={topicForm.description}
                      onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border text-slate-900 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold h-24"
                      placeholder="What will students learn in this topic?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Main Content</label>
                    <RichTextEditor
                      content={topicForm.content}
                      onChange={(content) => setTopicForm({ ...topicForm, content })}
                      placeholder="Enter topic content with rich formatting..."
                      minHeight="400px"
                    />
                  </div>

                  {/* Topic File Upload */}
                  {selectedModule && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Topic Files & Resources</label>
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <FileUploadManager
                          context={{
                            type: 'topic',
                            courseId: selectedCourse?.id,
                            moduleId: selectedModule.id,
                            topicId: 'new' // For new topics, we'll handle this differently
                          }}
                          showReadAloud={true} // Enable read-aloud for lecturers to preview content
                          onFileUpload={(file) => {
                            const newResource = {
                              type: file.type,
                              url: file.url,
                              title: file.original_filename
                            };
                            setTopicForm(prev => ({
                              ...prev,
                              resources: [...(prev.resources || []), newResource]
                            }));
                          }}
                          showFileManager={false} // Only show upload for new topics
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-600 transition-all"
                    >
                      {editingTopic ? 'Update Topic' : 'Deploy Topic'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorView('list');
                        setEditingTopic(null);
                        resetTopicForm();
                      }}
                      className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Course Info */}
          <div>
            <div className="glass-card p-6 rounded-2xl">
              <h4 className="font-bold text-slate-900 mb-4">Course Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Department:</span>
                  <span className="ml-2 text-slate-600">{selectedCourse.department}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Level:</span>
                  <span className="ml-2 text-slate-600 capitalize">{selectedCourse.level}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Duration:</span>
                  <span className="ml-2 text-slate-600">{selectedCourse.duration}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status:</span>
                  <span className="ml-2">{getStatusBadge((selectedCourse as any).status || 'draft')}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Files:</span>
                  <span className="ml-2">
                    <FileCounter 
                      context={{
                        type: 'course',
                        courseId: selectedCourse.id
                      }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Create Course Modal */}
    {showCreateCourseModal && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-bounce-in">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Create New Course</h3>

          <form onSubmit={handleCreateCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                <select
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Introduction to Programming"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what students will learn..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8 weeks"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateCourseModal(false);
                  resetCourseForm();
                }}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Quiz Builder Modal */}
    {showQuizBuilder && selectedTopic && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <QuizBuilder
            topicId={selectedTopic.id}
            onSave={(quizId) => {
              console.log('Quiz saved:', quizId);
              setShowQuizBuilder(false);
              setSelectedTopic(null);
              if (selectedCourse) {
                loadCourseModules(selectedCourse.id);
              }
            }}
            onCancel={() => {
              setShowQuizBuilder(false);
              setSelectedTopic(null);
            }}
          />
        </div>
      </div>
    )}

    {/* Delete Topic Confirmation Modal */}
    <ConfirmModal
      isOpen={showDeleteTopicConfirm}
      onClose={() => {
        setShowDeleteTopicConfirm(false);
        setTopicToDelete(null);
      }}
      onConfirm={handleDeleteTopic}
      title="Delete Topic"
      message={`Are you sure you want to delete "${topicToDelete?.title}"? This will also delete all associated quizzes and files. This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
  </div>
  );
};
