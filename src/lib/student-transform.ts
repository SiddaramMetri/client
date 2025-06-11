import { Task } from "@/page/dashboard/students/data/schema";

// Backend API Student interface (matches the API response)
export interface ApiStudent {
  _id: string;
  studentId?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string | Date;
  gender: 'male' | 'female' | 'other';
  classId: {
    _id: string;
    name: string;
    section?: string;
    academicYearId?: {
      _id: string;
      name: string;
    };
  } | string;
  rollNumber: string;
  studentEmail?: string;
  studentMobile: string;
  parentInfo: {
    fatherName: string;
    motherName?: string;
    primaryMobileNo: string;
    secondaryMobileNo?: string;
    email?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  admissionDate?: string | Date;
  isActive: boolean;
  profileImage?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  fullName?: string;
}

// Transform API student data to frontend table format
export const transformApiStudentToTask = (apiStudent: ApiStudent): Task => {
  const classInfo = typeof apiStudent.classId === 'object' ? apiStudent.classId : null;
  const academicYearInfo = classInfo?.academicYearId && typeof classInfo.academicYearId === 'object' 
    ? classInfo.academicYearId 
    : null;
  
  return {
    id: apiStudent._id,
    studentId: apiStudent.studentId,
    title: `${apiStudent.firstName}${apiStudent.middleName ? ` ${apiStudent.middleName}` : ''} ${apiStudent.lastName}`,
    firstName: apiStudent.firstName,
    lastName: apiStudent.lastName,
    className: classInfo ? classInfo.name : 'N/A',
    section: classInfo?.section || 'N/A',
    academicYear: academicYearInfo?.name || 'N/A',
    classId: typeof apiStudent.classId === 'string' ? apiStudent.classId : apiStudent.classId._id,
    rollNumber: apiStudent.rollNumber,
    dateOfBirth: typeof apiStudent.dateOfBirth === 'string' 
      ? apiStudent.dateOfBirth.split('T')[0]
      : apiStudent.dateOfBirth.toISOString().split('T')[0],
    gender: apiStudent.gender,
    studentEmail: apiStudent.studentEmail,
    studentMobile: apiStudent.studentMobile,
    fatherName: apiStudent.parentInfo.fatherName,
    parentMobile: apiStudent.parentInfo.primaryMobileNo,
    address: apiStudent.address ? 
      [
        apiStudent.address.street,
        apiStudent.address.city,
        apiStudent.address.state,
        apiStudent.address.pinCode
      ].filter(Boolean).join(', ') : undefined,
    admissionDate: apiStudent.admissionDate 
      ? (typeof apiStudent.admissionDate === 'string' 
          ? apiStudent.admissionDate.split('T')[0]
          : apiStudent.admissionDate.toISOString().split('T')[0])
      : undefined,
    status: apiStudent.isActive ? 'active' : 'inactive',
    priority: 'medium', // Default priority for table display
    rawData: apiStudent, // Store original API data for detailed operations
  };
};

// Transform frontend task data back to API format for create/update operations
export const transformTaskToApiStudent = (task: Partial<Task>): Partial<ApiStudent> => {
  const result: Partial<ApiStudent> = {};

  if (task.firstName) result.firstName = task.firstName;
  if (task.lastName) result.lastName = task.lastName;
  if (task.dateOfBirth) {
    result.dateOfBirth = new Date(task.dateOfBirth);
  }
  if (task.gender) result.gender = task.gender as 'male' | 'female' | 'other';
  if (task.classId) result.classId = task.classId;
  if (task.rollNumber) result.rollNumber = task.rollNumber;
  if (task.studentEmail) result.studentEmail = task.studentEmail;
  if (task.studentMobile) result.studentMobile = task.studentMobile;
  
  // Handle parent info
  if (task.fatherName || task.parentMobile) {
    result.parentInfo = {
      fatherName: task.fatherName || '',
      primaryMobileNo: task.parentMobile || '',
    };
  }

  // Handle status
  if (task.status !== undefined) {
    result.isActive = task.status === 'active';
  }

  // If we have raw data, use it as base and apply changes
  if (task.rawData) {
    return {
      ...task.rawData,
      ...result,
    };
  }

  return result;
};

// Transform array of API students to tasks
export const transformApiStudentsToTasks = (apiStudents: ApiStudent[]): Task[] => {
  return apiStudents.map(transformApiStudentToTask);
};

// Create student data from form submission (matches MultiStepStudentRegistration form structure)
export const createStudentFromForm = (formData: any): Partial<ApiStudent> => {
  return {
    firstName: formData.firstName,
    middleName: formData.middleName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    gender: formData.gender as 'male' | 'female' | 'other',
    classId: formData.classId,
    rollNumber: formData.rollNumber,
    studentEmail: formData.studentEmail,
    studentMobile: formData.studentMobile,
    parentInfo: {
      fatherName: formData.fatherName || '',
      motherName: formData.motherName,
      primaryMobileNo: formData.primaryMobileNo || '',
      secondaryMobileNo: formData.secondaryMobileNo,
      email: formData.parentEmail,
    },
    address: {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
      country: formData.country || 'India',
    },
    admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
    isActive: formData.isActive !== undefined ? formData.isActive : true,
    profileImage: formData.profileImage,
  };
};

// Validate student data before transformation
export const validateStudentData = (student: ApiStudent): boolean => {
  return !!(
    student.firstName &&
    student.lastName &&
    student.dateOfBirth &&
    student.gender &&
    student.classId &&
    student.rollNumber &&
    student.studentMobile &&
    student.parentInfo?.fatherName &&
    student.parentInfo?.primaryMobileNo
  );
};

// Get student display name
export const getStudentDisplayName = (student: ApiStudent | Task): string => {
  if ('title' in student) {
    return student.title;
  }
  
  const middleName = student.middleName ? ` ${student.middleName}` : '';
  return `${student.firstName}${middleName} ${student.lastName}`;
};

// Get formatted student info for display
export const getFormattedStudentInfo = (student: ApiStudent): {
  fullName: string;
  classInfo: string;
  contactInfo: string;
  parentContact: string;
} => {
  const classInfo = typeof student.classId === 'object' ? student.classId : null;
  
  return {
    fullName: getStudentDisplayName(student),
    classInfo: classInfo 
      ? `${classInfo.name}${classInfo.section ? ` - ${classInfo.section}` : ''} (Roll: ${student.rollNumber})`
      : `Roll: ${student.rollNumber}`,
    contactInfo: student.studentEmail 
      ? `${student.studentMobile} | ${student.studentEmail}`
      : student.studentMobile,
    parentContact: student.parentInfo.email
      ? `${student.parentInfo.primaryMobileNo} | ${student.parentInfo.email}`
      : student.parentInfo.primaryMobileNo,
  };
};