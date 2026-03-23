// User Service - Backend API Integration
import apiClient from '@/lib/apiClient';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  student_id?: string;
  is_active: boolean;
  preferences: {
    language: string;
    accessibility: {
      bionic_reading: boolean;
      dyslexia_font: boolean;
      high_contrast: string;
      voice_navigation: boolean;
    };
  };
  disability_info: {
    has_disability: boolean;
    disability_type: string[];
    assistive_technology: string[];
    accommodations_needed: string[];
  };
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface UpdateProfileData {
  full_name?: string;
  department?: string;
  preferences?: {
    language?: string;
    accessibility?: {
      bionic_reading?: boolean;
      dyslexia_font?: boolean;
      high_contrast?: string;
      voice_navigation?: boolean;
    };
  };
  disability_info?: {
    has_disability?: boolean;
    disability_type?: string[];
    assistive_technology?: string[];
    accommodations_needed?: string[];
  };
}

export interface UsersListResponse {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

class UserService {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/api/users/profile');
    return response.data.data;
  }

  // Update current user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put('/api/users/profile', data);
    return response.data.data;
  }

  // Get all users (Admin only)
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
  }): Promise<UsersListResponse> {
    const response = await apiClient.get('/api/users', { params });
    return response.data.data;
  }

  // Deactivate user (Admin only)
  async deactivateUser(userId: string): Promise<void> {
    await apiClient.put(`/api/users/${userId}/deactivate`);
  }

  // Activate user (Admin only)
  async activateUser(userId: string): Promise<void> {
    await apiClient.put(`/api/users/${userId}/activate`);
  }
}

export const userService = new UserService();
