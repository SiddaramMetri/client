import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  mobile: z.string(),
  role: z.string(),
  status: z.string(),
  isVerified: z.boolean(),
  lastLogin: z.string(),
})

export type UsersTask = z.infer<typeof userSchema>
