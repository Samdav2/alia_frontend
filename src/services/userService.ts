// User-related API calls

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  department: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate?: string;
}

export const userService = {
  async getUsers(role?: User['role']): Promise<User[]> {
    const url = new URL('/api/users', window.location.origin);
    if (role) url.searchParams.append('role', role);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUserById(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async createUser(userData: Omit<User, 'id' | 'status'>): Promise<User> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async approveUser(id: string): Promise<User> {
    return this.updateUser(id, { status: 'active' });
  },

  async resetPassword(id: string): Promise<void> {
    const response = await fetch(`/api/users/${id}/reset-password`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset password');
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },
};
