import { z } from 'zod'

export const ListingPayloadSchema = z.object({
  listingId: z.string(),
})

export type ListingPayload = z.infer<typeof ListingPayloadSchema>

export const PlaidTransactionPayloadSchema = z.object({
  organizationId: z.string(),
  plaidTransactionId: z.string(),
})

export type PlaidTransactionPayload = z.infer<
  typeof PlaidTransactionPayloadSchema
>
