import API from "@/lib/axios-client";
import { Task } from "../page/dashboard/students/data/schema";

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
  isActive?: boolean;
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
  return response.data;
};

export const getStudentByIdService = async (studentId: string): Promise<{ message: string; student: Task }> => {
  const response = await API.get(`/student/${studentId}`);
  return response.data;
};

export const createStudentService = async (data: Partial<Task>): Promise<{ message: string; student: Task }> => {
  const response = await API.post("/student", data);
  return response.data;
};

export const updateStudentService = async (
  studentId: string,
  data: Partial<Task>
): Promise<{ message: string; student: Task }> => {
  const response = await API.put(`/student/${studentId}`, data);
  return response.data;
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
