import { z } from 'zod'

export const GuestCreateSchema = z
  .object({
    name: z.string(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
  })
  .strict()
export type GuestCreate = z.infer<typeof GuestCreateSchema>

export const GuestEditSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().optional().nullable(),
  })
  .strict()
export type GuestEdit = z.infer<typeof GuestEditSchema>
