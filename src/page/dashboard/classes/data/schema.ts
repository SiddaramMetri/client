import { z } from "zod";

export const classSchema = z.object({
  _id: z.string(),
  academicYearId: z.object({
    _id: z.string(),
    year: z.string(),
    name: z.string(),
  }),
  name: z.string(),
  section: z.string().optional(),
  classTeacherId: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }).optional(),
  maxStudents: z.number(),
  currentStudentCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  fullName: z.string().optional(),
});

export type ClassData = z.infer<typeof classSchema>;