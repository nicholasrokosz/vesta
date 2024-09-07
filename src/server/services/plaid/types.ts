import type DateString from 'types/dateString'
import { z } from 'zod'

export const PlaidInstitutionSchema = z.object({
  name: z.string(),
  institution_id: z.string(),
})

export const PlaidAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  mask: z.string(),
  type: z.string(),
  subtype: z.string(),
  verification_status: z.string().nullable(),
})

export const PlaidLinkOnSuccessMetadataSchema = z.object({
  public_token: z.string(),
  institution: PlaidInstitutionSchema,
  accounts: z.array(PlaidAccountSchema),
  link_session_id: z.string(),
})

export type PlaidLinkOnSuccessMetadata = z.infer<
  typeof PlaidLinkOnSuccessMetadataSchema
>

export type PlaidImportTransaction = {
  accountId: string
  plaidId: string
  date: DateString
  amount: number
  vendor: string
  name: string
}
