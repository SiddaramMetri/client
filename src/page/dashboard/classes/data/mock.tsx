import { ClassData } from "./schema";
import classesMockData from './classesMock.json';

// Sample academic years for the test data
const academicYears = [
  { id: "1", name: "2024-2025" }
];

// Sample teachers for the test data
const teachers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Emma Davis" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Sarah Wilson" },
];

// Import classes data from JSON file and transform to match schema
export const mockClasses: ClassData[] = classesMockData.map((classItem: any) => ({
  _id: classItem._id || classItem.id,
  academicYearId: {
    _id: classItem.academicYearId || "1",
    year: classItem.academicYearName || "2024-2025",
    name: classItem.academicYearName || "2024-2025",
  },
  name: classItem.name,
  section: classItem.section,
  classTeacherId: classItem.classTeacherId ? {
    _id: classItem.classTeacherId,
    name: classItem.classTeacherName || "Unknown Teacher",
    email: `teacher${classItem.classTeacherId}@school.edu`,
  } : undefined,
  maxStudents: classItem.maxStudents || 40,
  currentStudentCount: classItem.currentStudentCount || 0,
  isActive: classItem.isActive !== false,
  createdAt: classItem.createdAt || new Date().toISOString(),
  updatedAt: classItem.updatedAt || new Date().toISOString(),
  fullName: classItem.fullName,
}));

// These are used in the dialog for selecting options
export const academicYearOptions = academicYears.map(year => ({
  value: year.id,
  label: year.name
}));

export const teacherOptions = teachers.map(teacher => ({
  value: teacher.id,
  label: teacher.name
}));
