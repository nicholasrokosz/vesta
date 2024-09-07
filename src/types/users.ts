import { z } from 'zod'

export const UserCreateSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    organizationRole: z.enum(['PROPERTY_OWNER', 'PROPERTY_MANAGER']),
  })
  .strict()

export type UserCreate = z.infer<typeof UserCreateSchema>
