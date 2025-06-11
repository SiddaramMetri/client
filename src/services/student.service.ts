import API from "@/lib/axios-client";
import { Task } from "../page/dashboard/students/data/schema";
import { 
  ApiStudent, 
  transformApiStudentsToTasks, 
  transformApiStudentToTask,
  transformTaskToApiStudent 
} from "@/lib/student-transform";

// Type definitions
export interface StudentUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  students: Array<Record<string, unknown>>;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  name?: string;
  classId?: string;
  academicYearId?: string;
  gender?: string;
  isActive?: boolean;
  admissionDateFrom?: string;
  admissionDateTo?: string;
}

export interface ApiStudentResponse {
  message: string;
  students: ApiStudent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StudentApiResponse {
  message: string;
  students: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// API Functions
export const getStudentsService = async (params: GetStudentsParams = {}): Promise<StudentApiResponse> => {
  const response = await API.get("/student", { params });
  const apiResponse: ApiStudentResponse = response.data;
  
  // Transform API students to frontend Task format
  const transformedStudents = transformApiStudentsToTasks(apiResponse.students);
  
  return {
    message: apiResponse.message,
    students: transformedStudents,
    pagination: apiResponse.pagination,
  };
};

export const getStudentByIdService = async (studentId: string): Promise<{ message: string; student: Task }> => {
  const response = await API.get(`/student/${studentId}`);
  const apiResponse: { message: string; student: ApiStudent } = response.data;
  
  // Transform API student to frontend Task format
  const transformedStudent = transformApiStudentToTask(apiResponse.student);
  
  return {
    message: apiResponse.message,
    student: transformedStudent,
  };
};

export const createStudentService = async (data: Partial<Task>): Promise<{ message: string; student: Task }> => {
  // Transform frontend data to API format
  const apiData = transformTaskToApiStudent(data);
  
  const response = await API.post("/student", apiData);
  const apiResponse: { message: string; student: ApiStudent } = response.data;
  
  // Transform response back to frontend format
  const transformedStudent = transformApiStudentToTask(apiResponse.student);
  
  return {
    message: apiResponse.message,
    student: transformedStudent,
  };
};

export const updateStudentService = async (
  studentId: string,
  data: Partial<Task>
): Promise<{ message: string; student: Task }> => {
  // Transform frontend data to API format
  const apiData = transformTaskToApiStudent(data);
  
  const response = await API.put(`/student/${studentId}`, apiData);
  const apiResponse: { message: string; student: ApiStudent } = response.data;
  
  // Transform response back to frontend format
  const transformedStudent = transformApiStudentToTask(apiResponse.student);
  
  return {
    message: apiResponse.message,
    student: transformedStudent,
  };
};

export const deleteStudentService = async (studentId: string): Promise<{ message: string }> => {
  const response = await API.delete(`/student/${studentId}`);
  return response.data;
};

// Excel operations
export const downloadStudentTemplateService = async (): Promise<Blob> => {
  const response = await API.get("/student/excel/template", {
    responseType: "blob",
  });
  return response.data;
};

export const uploadStudentExcelService = async (file: File): Promise<{ message: string; results: StudentUploadResult }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/student/excel/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};

export const toggleStudentStatusService = async (studentId: string): Promise<{ message: string; student: Task }> => {
  const response = await API.patch(`/student/${studentId}/toggle-status`);
  const apiResponse: { message: string; student: ApiStudent } = response.data;
  
  // Transform response back to frontend format
  const transformedStudent = transformApiStudentToTask(apiResponse.student);
  
  return {
    message: apiResponse.message,
    student: transformedStudent,
  };
};
