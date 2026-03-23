'use client';

import React, { useState, useEffect } from 'react';
import { adminService, Department } from '@/services/api/adminService';
import { useVisualNotification } from '@/components/Accessibility/VisualNotification';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head: '',
    description: ''
  });
  const { showNotification } = useVisualNotification();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Error loading departments:', err);
      showNotification('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await adminService.updateDepartment(editingDepartment.id, formData);
        showNotification('Department updated successfully', 'success');
      } else {
        await adminService.createDepartment(formData);
        showNotification('Department created successfully', 'success');
      }
      
      setShowCreateModal(false);
      setEditingDepartment(null);
      resetForm();
      loadDepartments();
    } catch (err) {
      showNotification('Failed to save department', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    
    try {
      await adminService.deleteDepartment(id);
      showNotification('Department deleted successfully', 'success');
      loadDepartments();
    } catch (err) {
      showNotification('Failed to delete department', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      head: '',
      description: ''
    });
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      head: department.head,
      description: department.description || ''
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Department Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Department Management</h2>
          <p className="text-slate-600 text-sm">Manage academic departments and their information</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingDepartment(null);
            setShowCreateModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          + Create Department
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-blue-600 mb-2">{departments.length}</div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Departments</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-green-600 mb-2">
            {departments.reduce((sum, d) => sum + d.student_count, 0)}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Students</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-purple-600 mb-2">
            {departments.reduce((sum, d) => sum + d.course_count, 0)}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Courses</div>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl font-black text-orange-600 mb-2">
            {Math.round(departments.reduce((sum, d) => sum + d.student_count, 0) / departments.length) || 0}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">Avg Students/Dept</div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="col-span-full glass-card p-12 rounded-2xl text-center">
            <div className="text-6xl mb-4">🏛️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No departments</h3>
            <p className="text-slate-600">Create your first department to get started.</p>
          </div>
        ) : (
          departments.map((department) => (
            <div key={department.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                    {department.code}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{department.name}</h3>
                    <p className="text-sm text-slate-600">{department.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(department)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(department.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold">👤 Head:</span>
                  <span>{department.head}</span>
                </div>
                
                {department.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {department.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">👥</span>
                      {department.student_count} students
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">📚</span>
                      {department.course_count} courses
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {editingDepartment ? 'Edit Department' : 'Create New Department'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Department Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS"
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Head of Department</label>
                <input
                  type="text"
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dr. John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the department..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDepartment(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  {editingDepartment ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};