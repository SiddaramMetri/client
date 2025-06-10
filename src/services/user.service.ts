import { api as API } from '@/http/client';

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace?: {
    _id: string;
    name: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  profilePicture?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  profilePicture?: string;
  isActive?: boolean;
  currentWorkspace?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  message: string;
}

export interface ApiResponse<T> {
  message: string;
  user?: T;
  users?: T[];
}

// Get all users with pagination
export const getAllUsers = async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
  const response = await API.get('/user', { params });
  console.log("API response:", response.data);
  console.log("Users data:", response.data.data);
  if (response.data.data && response.data.data.length > 0) {
    console.log("First user example:", response.data.data[0]);
    console.log("First user isActive:", response.data.data[0].isActive, typeof response.data.data[0].isActive);
  }
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await API.get(`/user/${id}`);
  return response.data.user;
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await API.post('/user', userData);
  return response.data.user;
};

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
  const response = await API.put(`/user/${id}`, userData);
  return response.data.user;
};

// Delete user (soft delete)
export const deleteUser = async (id: string, permanent: boolean = false): Promise<{ message: string }> => {
  const response = await API.delete(`/user/${id}`, { 
    params: { permanent: permanent.toString() } 
  });
  return response.data;
};

// Toggle user status
export const toggleUserStatus = async (id: string): Promise<{ user: User; message: string }> => {
  const response = await API.patch(`/user/${id}/toggle-status`);
  return response.data;
};

// Bulk update users
export const bulkUpdateUsers = async (
  userIds: string[], 
  updateData: Partial<UpdateUserData>
): Promise<{ modifiedCount: number; message: string }> => {
  const response = await API.patch('/user/bulk', { userIds, updateData });
  return response.data;
};

// Get user statistics
export const getUserStats = async (): Promise<{
  activeUsers: number;
  inactiveUsers: number;
  totalUsers: number;
}> => {
  const response = await API.get('/user/stats');
  return response.data.stats;
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const response = await API.get('/user/current');
  return response.data.user;
};