import { z } from "zod";

// Class Schema validation using Zod, based on the MongoDB schema provided
export const classSchema = z.object({
  id: z.string().optional(), // Front-end ID for table operations
  _id: z.string().optional(), // MongoDB ObjectId as string
  academicYearId: z.string(), // ObjectId reference as string
  academicYearName: z.string().optional(), // For display purposes
  name: z.string().trim().max(50, "Class name must be less than 50 characters"),
  section: z.string().trim().max(10, "Section must be less than 10 characters").optional(),
  classTeacherId: z.string().optional(), // ObjectId reference as string
  classTeacherName: z.string().optional(), // For display purposes
  maxStudents: z.number().min(0, "Maximum students must be at least 0").default(2000),
  currentStudentCount: z.number().min(0, "Current student count must be at least 0").default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(), // ISO Date string
  updatedAt: z.string().optional(), // ISO Date string
});

export type ClassData = z.infer<typeof classSchema>;
