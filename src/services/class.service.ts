import API from '@/lib/axios-client';

export interface Class {
  _id: string;
  academicYearId?: {
    _id: string;
    year: string;
    name: string;
  };
  name: string;
  section?: string;
  classTeacherId?: {
    _id: string;
    name: string;
    email: string;
  };
  maxStudents: number;
  currentStudentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

export interface CreateClassData {
  academicYearId: string;
  name: string;
  section?: string;
  classTeacherId?: string;
  maxStudents?: number;
}

export interface UpdateClassData {
  academicYearId?: string;
  name?: string;
  section?: string;
  classTeacherId?: string;
  maxStudents?: number;
  isActive?: boolean;
}

export interface ClassFilters {
  page?: number;
  limit?: number;
  search?: string;
  academicYearId?: string;
  classTeacherId?: string;
  isActive?: 'all' | 'true' | 'false';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassResponse {
  success: boolean;
  message: string;
  data: Class[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleClassResponse {
  success: boolean;
  message: string;
  data: Class;
}

export interface ClassStats {
  totalClasses: number;
  activeClasses: number;
  inactiveClasses: number;
  totalStudents: number;
  totalCapacity: number;
  averageClassSize: number;
  utilizationPercentage: number;
}

export interface ClassStatsResponse {
  success: boolean;
  message: string;
  data: ClassStats;
}

export const classService = {
  // Get all classes with pagination and filters
  async getClasses(filters: ClassFilters = {}): Promise<ClassResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await API.get(`/class?${params.toString()}`);
    return response.data;
  },

  // Get class by ID
  async getClassById(id: string): Promise<SingleClassResponse> {
    const response = await API.get(`/class/${id}`);
    return response.data;
  },

  // Create new class
  async createClass(data: CreateClassData): Promise<SingleClassResponse> {
    const response = await API.post('/class', data);
    return response.data;
  },

  // Update class
  async updateClass(id: string, data: UpdateClassData): Promise<SingleClassResponse> {
    const response = await API.put(`/class/${id}`, data);
    return response.data;
  },

  // Delete class (soft delete)
  async deleteClass(id: string): Promise<SingleClassResponse> {
    const response = await API.delete(`/class/${id}`);
    return response.data;
  },

  // Get class statistics
  async getClassStats(): Promise<ClassStatsResponse> {
    const response = await API.get('/class/stats');
    return response.data;
  },
};