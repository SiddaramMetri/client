import API from '@/lib/axios-client';

export interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalWorkingDays: number;
  holidays: Holiday[];
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'regional' | 'school';
}

export interface CreateAcademicYearData {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  totalWorkingDays?: number;
  holidays?: Holiday[];
}

export interface UpdateAcademicYearData {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  totalWorkingDays?: number;
  holidays?: Holiday[];
}

export interface AcademicYearFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: 'all' | 'true' | 'false';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AcademicYearResponse {
  success: boolean;
  message: string;
  data: AcademicYear[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleAcademicYearResponse {
  success: boolean;
  message: string;
  data: AcademicYear;
}

export const academicYearService = {
  // Get all academic years with pagination and filters
  async getAcademicYears(filters: AcademicYearFilters = {}): Promise<AcademicYearResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await API.get(`/academic-year?${params.toString()}`);
    return response.data;
  },

  // Get all academic years (simplified for dropdown)
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    const response = await API.get('/academic-year?limit=100&sortBy=startDate&sortOrder=desc');
    return response.data.data;
  },

  // Get academic year by ID
  async getAcademicYearById(id: string): Promise<SingleAcademicYearResponse> {
    const response = await API.get(`/academic-year/${id}`);
    return response.data;
  },

  // Get active academic year
  async getActiveAcademicYear(): Promise<SingleAcademicYearResponse> {
    const response = await API.get('/academic-year/active');
    return response.data;
  },

  // Get academic year by date
  async getAcademicYearByDate(date: string): Promise<SingleAcademicYearResponse> {
    const response = await API.get(`/academic-year/by-date?date=${date}`);
    return response.data;
  },

  // Create new academic year
  async createAcademicYear(data: CreateAcademicYearData): Promise<SingleAcademicYearResponse> {
    const response = await API.post('/academic-year', data);
    return response.data;
  },

  // Update academic year
  async updateAcademicYear(id: string, data: UpdateAcademicYearData): Promise<SingleAcademicYearResponse> {
    const response = await API.put(`/academic-year/${id}`, data);
    return response.data;
  },

  // Set academic year as active
  async setActiveAcademicYear(id: string): Promise<SingleAcademicYearResponse> {
    const response = await API.patch(`/academic-year/${id}/set-active`);
    return response.data;
  },

  // Delete academic year (soft delete)
  async deleteAcademicYear(id: string): Promise<SingleAcademicYearResponse> {
    const response = await API.delete(`/academic-year/${id}`);
    return response.data;
  },

  // Add holiday to academic year
  async addHoliday(id: string, holiday: Holiday): Promise<SingleAcademicYearResponse> {
    const response = await API.post(`/academic-year/${id}/holidays`, holiday);
    return response.data;
  },

  // Remove holiday from academic year
  async removeHoliday(id: string, date: string): Promise<SingleAcademicYearResponse> {
    const response = await API.delete(`/academic-year/${id}/holidays`, { data: { date } });
    return response.data;
  },

  // Update working days for academic year
  async updateWorkingDays(id: string): Promise<SingleAcademicYearResponse> {
    const response = await API.patch(`/academic-year/${id}/update-working-days`);
    return response.data;
  },
};