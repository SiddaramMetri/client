// Core enums and constants
export const GENDER_OPTIONS = ['male', 'female', 'other'] as const;
export const STUDENT_STATUS = ['active', 'inactive'] as const;

// Base types
export type Gender = typeof GENDER_OPTIONS[number];
export type StudentStatus = typeof STUDENT_STATUS[number];

// Address information interface
export interface StudentAddress {
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}

// Parent information interface
export interface ParentInfo {
  fatherName: string;
  motherName?: string;
  primaryMobileNo: string;
  secondaryMobileNo?: string;
  email?: string;
}

// Academic year reference (populated from backend)
export interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  workingDays: number;
  holidays: Array<{
    date: string;
    name: string;
    isRecurring: boolean;
  }>;
}

// Class reference (populated from backend)
export interface StudentClass {
  _id: string;
  name: string;
  section?: string;
  academicYearId: string | AcademicYear;
  maxStudents: number;
  currentStudentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Raw data interface for imported/legacy data
export interface StudentRawData {
  admissionDate?: string;
  parentInfo?: ParentInfo;
  address?: StudentAddress;
  // Legacy fields that might exist in raw data
  [key: string]: string | number | boolean | object | null | undefined;
}

// Main student interface - core entity
export interface Students {
  _id: string;
  studentId?: string; // Auto-generated unique ID (STD-XXXXXXXX)
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  profileImage?: string;
  
  // Contact Information
  studentEmail?: string;
  studentMobile: string;
  
  // Academic Information
  classId: string | StudentClass;
  rollNumber: string;
  admissionDate?: string;
  
  // Parent Information
  parentInfo?: ParentInfo;
  // Legacy parent fields (for backward compatibility)
  fatherName?: string;
  parentMobile?: string;
  
  // Address Information
  address?: string | StudentAddress;
  
  // Status and Metadata
  isActive: boolean;
  status: StudentStatus; // Computed from isActive
  createdAt: string;
  updatedAt: string;
  
  // Virtual/Computed Fields
  fullName?: string;
  className?: string; // Populated class name
  
  // Raw data from imports/legacy systems
  rawData?: StudentRawData;
  
  // Additional fields for UI compatibility
  id?: string; // Fallback ID field
}

// Student creation/update DTOs
export interface CreateStudentRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  studentMobile: string;
  rollNumber: string;
  classId: string;
  studentEmail?: string;
  admissionDate?: string;
  profileImage?: string;
  parentInfo?: ParentInfo;
  address?: StudentAddress;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  isActive?: boolean;
}

// Multi-step form interfaces for progressive student creation
export interface StudentBasicInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  studentMobile: string;
  middleName?: string;
}

export interface StudentAcademicDetails {
  rollNumber: string;
  classId: string;
  admissionDate?: string;
  studentEmail?: string;
}

export interface StudentParentDetails {
  parentInfo: ParentInfo;
}

export interface StudentAddressDetails {
  address?: StudentAddress;
}

export interface StudentFinalSetup {
  profileImage?: string;
}

// API response interfaces
export interface StudentsResponse {
  students: Students[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentResponse {
  student: Students;
}

// Query and filter interfaces
export interface StudentFilters {
  classId?: string;
  academicYearId?: string;
  gender?: Gender;
  isActive?: boolean;
  search?: string; // Search in name, studentId, rollNumber
}

export interface StudentQueryParams extends StudentFilters {
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'rollNumber' | 'createdAt' | 'admissionDate';
  sortOrder?: 'asc' | 'desc';
}

// Bulk operations interfaces
export interface BulkStudentImport {
  file: File;
  classId: string;
  skipDuplicates?: boolean;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value?: string | number | boolean | null;
  }>;
  duplicates?: Array<{
    row: number;
    studentId?: string;
    rollNumber: string;
    name: string;
  }>;
}

// Validation error interface
export interface StudentValidationError {
  field: string;
  message: string;
  code: string;
}

// Student statistics interface
export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  byGender: {
    male: number;
    female: number;
    other: number;
  };
  byClass: Array<{
    classId: string;
    className: string;
    count: number;
  }>;
  recentlyAdded: number; // Last 30 days
}

// Form state interfaces for UI components
export interface StudentFormState {
  currentStep: number;
  totalSteps: number;
  data: Partial<CreateStudentRequest>;
  errors: Record<string, string>;
  isValid: boolean;
}

// Selection and bulk action interfaces
export interface StudentSelection {
  selectedIds: string[];
  selectAll: boolean;
  excludedIds: string[];
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete' | 'transfer';
  targetClassId?: string; // For transfer action
  confirmationRequired: boolean;
}

// Export interfaces
export interface StudentExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  fields: Array<keyof Students>;
  filters?: StudentFilters;
  includeInactive?: boolean;
}

// Type guards for runtime type checking
export const isStudentClass = (value: string | StudentClass): value is StudentClass => {
  return typeof value === 'object' && value !== null && '_id' in value;
};

export const isStudentAddress = (value: string | StudentAddress): value is StudentAddress => {
  return typeof value === 'object' && value !== null;
};

// Utility types for component props
export type StudentDisplayFields = Pick<Students, 'firstName' | 'lastName' | 'studentId' | 'rollNumber' | 'className' | 'status'>;
export type StudentContactInfo = Pick<Students, 'studentEmail' | 'studentMobile' | 'parentMobile'> & { parentInfo?: ParentInfo };
export type StudentAcademicInfo = Pick<Students, 'classId' | 'rollNumber' | 'admissionDate'> & { className?: string };