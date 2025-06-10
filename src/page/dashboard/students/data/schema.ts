import { z } from "zod"

// Student schema for the UI
export const taskSchema = z.object({
  id: z.string(),
  studentId: z.string().optional(),
  title: z.string(), // This will be the student's full name
  firstName: z.string(),
  lastName: z.string(),
  className: z.string().optional(),
  classId: z.string().nullable().optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  studentEmail: z.string().optional(),
  studentMobile: z.string().optional(),
  fatherName: z.string().optional(),
  parentMobile: z.string().optional(),
  address: z.string().optional(),
  status: z.string(),
  label: z.string().optional(),
  priority: z.string(),
  rawData: z.any().optional(), // For storing the original API data
})

export type Task = z.infer<typeof taskSchema>
