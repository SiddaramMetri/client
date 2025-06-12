import { z } from "zod"

// User schema for data table
export const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  profilePicture: z.string().nullable().optional(),
  isActive: z.boolean(),
  lastLogin: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  currentWorkspace: z.object({
    _id: z.string(),
    name: z.string()
  }).nullable().optional(),
  role: z.object({
    permissions: z.array(z.string()),
    roles: z.array(z.object({
      roleId: z.string(),
      roleName: z.string(),
      roleCode: z.string(),
      level: z.number(),
      context: z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        classId: z.string().optional()
      }).optional()
    }))
  }).optional()
})

export type User = z.infer<typeof userSchema>

// Form validation schemas
export const createUserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.literal("")
  ]).optional(),
  profilePicture: z.string().url("Invalid URL format").optional().or(z.literal("")),
  isActive: z.boolean().default(true)
})

export const updateUserFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format"),
  profilePicture: z.string().url("Invalid URL format").optional().or(z.literal("")),
  isActive: z.boolean()
})

export type CreateUserFormData = z.infer<typeof createUserFormSchema>
export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>

// Table filtering schema
export const userFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'updatedAt', 'lastLogin']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type UserFilterData = z.infer<typeof userFilterSchema>