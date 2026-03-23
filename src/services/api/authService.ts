// Authentication Service - Backend API Integration
import apiClient from '@/lib/apiClient';

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  student_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    full_name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    department?: string;
    student_id?: string;
  };
  token: string;
  refresh_token: string;
}

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', data);

    // Store tokens
    if (response.data.data?.token) {
      this.setTokens(response.data.data.token, response.data.data.refresh_token);
    }

    return response.data.data;
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', data);

    // Store tokens
    if (response.data.data?.token) {
      this.setTokens(response.data.data.token, response.data.data.refresh_token);
    }

    return response.data.data;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ token: string; refresh_token: string }> {
    const response = await apiClient.post('/api/auth/refresh', { refresh_token: refreshToken });

    // Update stored tokens
    if (response.data.data?.token) {
      this.setTokens(response.data.data.token, response.data.data.refresh_token);
    }

    return response.data.data;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // Store tokens in localStorage
  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Clear tokens from localStorage
  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get current user from localStorage
  getCurrentUser(): AuthResponse['user'] | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  // Store user data
  setCurrentUser(user: AuthResponse['user']): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
