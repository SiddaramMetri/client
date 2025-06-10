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

// Import classes data from JSON file
export const mockClasses: ClassData[] = classesMockData as ClassData[];

// These are used in the dialog for selecting options
export const academicYearOptions = academicYears.map(year => ({
  value: year.id,
  label: year.name
}));

export const teacherOptions = teachers.map(teacher => ({
  value: teacher.id,
  label: teacher.name
}));
