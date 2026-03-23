'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService, UserProfile as UserProfileData } from '@/services/api/userService';
import { authService } from '@/services/api/authService';
import { useUserPreferences } from '@/context/UserPreferencesContext';

const DISABILITY_TYPES = [
  'Visual impairment',
  'Hearing impairment',
  'Motor/Physical disability',
  'Cognitive disability',
  'Learning disability (Dyslexia)',
  'Learning disability (ADHD)',
  'Autism spectrum disorder',
  'Speech/Language disorder',
  'Multiple disabilities',
  'Other'
];

const ASSISTIVE_TECHNOLOGIES = [
  'Screen reader (JAWS, NVDA, VoiceOver)',
  'Screen magnification software',
  'Voice recognition software',
  'Alternative keyboard',
  'Eye-tracking device',
  'Switch access device',
  'Hearing aids',
  'Cochlear implant',
  'FM/Audio system',
  'Braille display',
  'Other'
];

const ACCOMMODATIONS = [
  'Extended time for assessments',
  'Alternative format materials',
  'Sign language interpreter',
  'Note-taking assistance',
  'Preferential seating',
  'Reduced distraction environment',
  'Audio recordings of lectures',
  'Large print materials',
  'Braille materials',
  'Captioned videos',
  'Voice-to-text software',
  'Text-to-speech software',
  'Other'
];

export const UserProfile: React.FC = () => {
  const {
    bionicReading,
    dyslexiaFont,
    highContrast,
    voiceNavigation,
    setBionicReading,
    setDyslexiaFont,
    setHighContrast,
    setVoiceNavigation
  } = useUserPreferences();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'accessibility' | 'preferences' | 'emergency'>('basic');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Try to get user profile from API first
      try {
        const profileData = await userService.getProfile();
        setProfile(profileData);
      } catch (apiError) {
        // Fallback to stored user data
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          // Convert stored user to profile format
          const fallbackProfile: UserProfileData = {
            id: storedUser.id,
            full_name: storedUser.full_name,
            email: storedUser.email,
            role: storedUser.role,
            department: storedUser.department || '',
            student_id: storedUser.student_id || '',
            is_active: true,
            preferences: {
              language: 'English',
              accessibility: {
                bionic_reading: bionicReading,
                dyslexia_font: dyslexiaFont,
                high_contrast: highContrast,
                voice_navigation: voiceNavigation
              }
            },
            disability_info: {
              has_disability: false,
              disability_type: [],
              assistive_technology: [],
              accommodations_needed: []
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };
          setProfile(fallbackProfile);
        }
      }
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      // Try to update via API
      try {
        const updatedProfile = await userService.updateProfile({
          full_name: profile.full_name,
          department: profile.department,
          preferences: profile.preferences,
          disability_info: profile.disability_info
        });
        setProfile(updatedProfile);
      } catch (apiError) {
        console.error('API update failed, saving locally:', apiError);
        // Save to localStorage as fallback
        localStorage.setItem('user-profile', JSON.stringify(profile));
      }

      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!profile) return;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof UserProfileData;

      setProfile(prev => {
        if (!prev) return null;
        const parentObj = prev[parentKey];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parentKey]: {
              ...parentObj,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleArrayToggle = (field: string, value: string) => {
    if (!profile) return;

    const currentArray = field.includes('.')
      ? profile.disability_info[field.split('.')[1] as keyof typeof profile.disability_info] as string[]
      : [];

    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    handleInputChange(field, newArray);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <p className="font-medium">{error || 'Failed to load profile'}</p>
            <button
              onClick={loadUserProfile}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen soft-gradient-bg pb-24 lg:pb-12 pt-6 sm:pt-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/student" className="text-blue-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline flex items-center gap-2 mb-3 sm:mb-4">
              <span>←</span> Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              User <span className="alia-gradient-text">Profile</span>
            </h1>
            <p className="text-slate-500 font-bold mt-2 text-sm sm:text-base">Manage your personal information and accessibility settings</p>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed ${isEditing
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-blue-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black">
              {profile.full_name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profile.full_name}</h2>
              <p className="text-slate-500 font-bold text-sm sm:text-base">{profile.student_id} • {profile.department}</p>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{profile.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 border-b border-slate-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium disabled:bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium disabled:bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={profile.student_id || ''}
                    onChange={(e) => handleInputChange('student_id', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium disabled:bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium disabled:bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    disabled={true}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Account Status</label>
                  <input
                    type="text"
                    value={profile.is_active ? 'Active' : 'Inactive'}
                    disabled={true}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium bg-slate-50 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="space-y-8">
                {/* Disability Status */}
                <div>
                  <label className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={profile.disability_info.has_disability}
                      onChange={(e) => handleInputChange('disability_info.has_disability', e.target.checked)}
                      disabled={!isEditing}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-black text-slate-700">I have a disability that may affect my learning</span>
                  </label>
                </div>

                {profile.disability_info.has_disability && (
                  <>
                    {/* Disability Types */}
                    <div>
                      <h4 className="font-black text-slate-700 mb-3 text-sm sm:text-base">Type of Disability (select all that apply)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {DISABILITY_TYPES.map((type) => (
                          <label key={type} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/40 rounded-lg sm:rounded-xl border border-white/60">
                            <input
                              type="checkbox"
                              checked={profile.disability_info.disability_type.includes(type)}
                              onChange={() => handleArrayToggle('disability_info.disability_type', type)}
                              disabled={!isEditing}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-600">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Assistive Technology */}
                    <div>
                      <h4 className="font-black text-slate-700 mb-3 text-sm sm:text-base">Assistive Technology Used</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {ASSISTIVE_TECHNOLOGIES.map((tech) => (
                          <label key={tech} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/40 rounded-lg sm:rounded-xl border border-white/60">
                            <input
                              type="checkbox"
                              checked={profile.disability_info.assistive_technology.includes(tech)}
                              onChange={() => handleArrayToggle('disability_info.assistive_technology', tech)}
                              disabled={!isEditing}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-600">{tech}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Accommodations */}
                    <div>
                      <h4 className="font-black text-slate-700 mb-3 text-sm sm:text-base">Accommodations Needed</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {ACCOMMODATIONS.map((accommodation) => (
                          <label key={accommodation} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/40 rounded-lg sm:rounded-xl border border-white/60">
                            <input
                              type="checkbox"
                              checked={profile.disability_info.accommodations_needed.includes(accommodation)}
                              onChange={() => handleArrayToggle('disability_info.accommodations_needed', accommodation)}
                              disabled={!isEditing}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-600">{accommodation}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Current Accessibility Settings */}
                <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h4 className="font-black text-slate-700 mb-4 text-sm sm:text-base">Current Accessibility Settings</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mx-auto mb-2 flex items-center justify-center text-sm sm:text-base ${bionicReading ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                        📖
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold">Bionic Reading</div>
                      <div className="text-[9px] sm:text-xs text-slate-500">{bionicReading ? 'On' : 'Off'}</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mx-auto mb-2 flex items-center justify-center text-sm sm:text-base ${dyslexiaFont ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                        🔤
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold">Dyslexia Font</div>
                      <div className="text-[9px] sm:text-xs text-slate-500">{dyslexiaFont ? 'On' : 'Off'}</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mx-auto mb-2 flex items-center justify-center text-sm sm:text-base ${highContrast !== 'standard' ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                        🎨
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold">High Contrast</div>
                      <div className="text-[9px] sm:text-xs text-slate-500">{highContrast !== 'standard' ? 'On' : 'Off'}</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mx-auto mb-2 flex items-center justify-center text-sm sm:text-base ${voiceNavigation ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>
                        🎤
                      </div>
                      <div className="text-[10px] sm:text-xs font-bold">Voice Nav</div>
                      <div className="text-[9px] sm:text-xs text-slate-500">{voiceNavigation ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Preferences */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Language Preference</label>
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium disabled:bg-slate-50 text-sm sm:text-base"
                  >
                    <option value="English">English</option>
                    <option value="Igbo">Igbo</option>
                    <option value="Hausa">Hausa</option>
                    <option value="Yoruba">Yoruba</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Account Created</label>
                  <input
                    type="text"
                    value={new Date(profile.created_at).toLocaleDateString()}
                    disabled={true}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Last Login</label>
                  <input
                    type="text"
                    value={profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}
                    disabled={true}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium bg-slate-50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-black text-slate-700 mb-2">Profile Updated</label>
                  <input
                    type="text"
                    value={new Date(profile.updated_at).toLocaleDateString()}
                    disabled={true}
                    className="w-full p-2.5 sm:p-3 border border-slate-200 rounded-lg sm:rounded-xl font-medium bg-slate-50 text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {activeTab === 'emergency' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🚧</div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Emergency Contact Management
                </h3>
                <p className="text-slate-600 font-medium">
                  Emergency contact management will be available in a future update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
