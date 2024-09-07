import type { Prisma } from '@prisma/client'
import {
  RulesUncheckedCreateInputSchema,
  AmenityUncheckedCreateInputSchema,
  ListingUncheckedUpdateInputSchema,
  FeeUncheckedCreateInputSchema,
} from '../prisma/generated/zod'

export interface IAddress {
  line1: string
  line2: string | null
  city: string
  state: string
  zip: string
  country: string
}

export interface IAmenity {
  id?: string
  typeId: string
  name: string
  checked?: boolean
  note?: string
  categories: AmenityCategory[] | null
}

export interface IButtonAmenity {
  name: string
  typeId: string
  icon: JSX.Element
  selected: boolean
}

export enum FeeUnit {
  PerStay = 'PerStay',
  PerDay = 'PerDay',
  PerPerson = 'PerPerson',
  PerDayPerPerson = 'PerDayPerPerson',
  PerDayPerPersonExtra = 'PerDayPerPersonExtra',
}

export enum FeeType {
  CleaningFee = 'CleaningFee',
  PetFee = 'PetFee',
  General = 'General',
  Deposit = 'Deposit',
}

export type AmenityCategory = (typeof amenityCategories)[number]
export const amenityCategories = [
  'Popular',
  'Bathroom',
  'Bedroom & laundry',
  'Entertainment',
  'Family',
  'Heating & cooling',
  'Home safety',
  'Internet & office',
  'Kitchen & dining',
  'Location features',
  'Outdoor',
  'Parking & facilities',
  'Services',
  'Accessibility',
  'Nearby activities',
]

export type RulesCreate = Prisma.RulesUncheckedCreateInput
export const RulesCreateSchema = RulesUncheckedCreateInputSchema

export type AmenityCreate = Prisma.AmenityUncheckedCreateInput
export const AmenityCreateSchema = AmenityUncheckedCreateInputSchema

export type AmenityUpdate = Prisma.ListingUncheckedUpdateInput
export const AmenityUpdateSchema = ListingUncheckedUpdateInputSchema

export type FeeCreate = Prisma.FeeUncheckedCreateInput
export const FeeCreateSchema = FeeUncheckedCreateInputSchema

export type FeeUpdate = Prisma.ListingUncheckedUpdateInput
export const FeeUpdateSchema = ListingUncheckedUpdateInputSchema
