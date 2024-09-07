import type { KeyType, Prisma } from '@prisma/client'
import { z } from 'zod'
import { UnitTypeSchema } from '../../prisma/generated/zod'

// ## Content ##

export type Content = Omit<Prisma.ContentUncheckedCreateInput, 'bedrooms'> & {
  bedrooms: Bedroom[]
}

export const ContentCreateSchema: z.ZodType<Content> = z
  .object({
    id: z.string().optional(),
    listingId: z.string(),
    photos: z.string().array(),
    title: z.string(),
    description: z.string(),
    aiInfo: z.string().optional().nullable(),
    bedrooms: z.lazy(() => BedroomSchema).array(),
  })
  .strict()

export type Bedroom = Omit<
  Prisma.BedroomUncheckedCreateInput,
  'contentId' | 'beds'
> & {
  beds: string[]
}

export const BedroomSchema: z.ZodType<Bedroom> = z
  .object({
    id: z.string().optional(),
    type: z.string(),
    bathroom: z.boolean().optional(),
    beds: z.string().array(),
  })
  .strict()

export const ListingSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    unitType: UnitTypeSchema,
    beds: z.number(),
    baths: z.number(),
    guests: z.number(),
    line1: z.string(),
    line2: z.string().optional().nullable(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    timeZone: z.string(),
    propertyManagerId: z.string(),
    propertyOwnerId: z.string().optional().nullable(),
    wifiName: z.string().optional().nullable(),
    wifiPassword: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    doorCode: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    basePrice: z.number().gt(0),
    iCalKey: z.string().optional().nullable(),
  })
  .strict()
export type Listing = z.infer<typeof ListingSchema>

export const FeeCreateSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    value: z.number(),
    unit: z.string(),
    taxable: z.boolean(),
    type: z.string(),
    share: z.number(),
  })
  .strict()
export type FeeCreate = z.infer<typeof FeeCreateSchema>

export const DeductionsSchema = z.object({
  id: z.string().optional(),
  listingId: z.string(),
  channelFees: z.boolean(),
  creditCardFees: z.boolean(),
  discounts: z.boolean(),
  municipalTaxes: z.boolean(),
  countyTaxes: z.boolean(),
  stateTaxes: z.boolean(),
  otherGuestFees: z.boolean(),
  pmcShare: z.number(),
})

export const TaxRatesSchema = z.object({
  id: z.string().optional(),
  municipal: z.number().default(0),
  county: z.number().default(0),
  state: z.number().default(0),
})

export const BusinessModelSchema = z.object({
  listingId: z.string().optional(),
  deductions: DeductionsSchema,
  taxRates: TaxRatesSchema,
  fees: FeeCreateSchema.array(),
  airbnbRemitsTaxes: z.boolean(),
})

export type Deductions = z.infer<typeof DeductionsSchema>
export type TaxRates = z.infer<typeof TaxRatesSchema>
export type BusinessModel = z.infer<typeof BusinessModelSchema>
// create listing service (see calendar service and calendar router)

export const NotesUpdateSchema = z.object({
  listingId: z.string(),
  notes: z.string(),
})
export type Notes = z.infer<typeof NotesUpdateSchema>

export const AvailabilitySchema = z.object({
  id: z.string().optional(),
  listingId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  leadTime: z.number().optional(),
})
export type Availability = z.infer<typeof AvailabilitySchema>

export interface ListingWithDirectBookingKey {
  id: string
  name: string
  key: string
  keyType: KeyType
  widgetUrl: string
}
