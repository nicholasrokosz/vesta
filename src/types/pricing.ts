import { z } from 'zod'
import { DynamicPricingSchema } from '../../prisma/generated/zod'

export const PricingDateSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    percent: z.number(),
  })
  .strict()

// TODO: Exactly one of percent or amount should be required
// PricingDiscountSchema.refine((pricing) => pricing.percent > object.amount)
export const PricingDiscountSchema = z
  .object({
    days: z.number(),
    percent: z.number().default(0),
  })
  .strict()

export const PricingSchema = z
  .object({
    id: z.string(),
    listingId: z.string(),
    minimum: z.number(),
    weekday: z.number(),
    weekend: z.number(),
    dates: PricingDateSchema.array(),
    discounts: PricingDiscountSchema.array(),
    dynamicPricing: DynamicPricingSchema,
    minStay: z.number(),
    maxStay: z.number(),
  })
  .strict()

export const PricingCreateSchema = PricingSchema.extend({
  id: z.string().optional(),
})

export type Pricing = z.infer<typeof PricingSchema>
export type PricingCreate = z.infer<typeof PricingCreateSchema>
export type PricingDate = z.infer<typeof PricingDateSchema>
