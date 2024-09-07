import type { MessageUser } from '@prisma/client'

export interface PropertyManager {
  id: number
  name: string
  extraName: string
  emailAddress: string
}
export interface Company {
  isCompany: true
  companyDetails: CompanyDetails
  policies: Policies
  // pub payment:,
}

export interface CompanyResponse extends Company {
  id: number // ID returned from company in Booking Pal's system
}

export interface CompanyDetails {
  accountId: string // Vesta PMS Organization ID
  companyName: string
  language: string // Two letter ISO code, default to en
  fullName: string // Use 'admin' user or company Name again
  companyAddress: CompanyAddress
  website: string
  email: string // <company-name-slug>@getvesta.io
  phone: Phone
  password: string
  currency: string // Three letter ISO code, default to USD
}

export interface CompanyAddress {
  country: string // Two letter ISO code, default to US
  state: string
  streetAddress: string
  city: string
  zip: string
}

export interface Phone {
  countryCode: string // Default to '+1' for US
  number: string
}

export interface Policies {
  paymentPolicy: PaymentPolicy
  cancellationPolicy: CancellationPolicy
  feeTaxMandatory: FeeTaxMandatory
  terms: string // URL
  checkInTime: string // HH:MM:SS
  checkOutTime: string // HH:MM:SS
  leadTime: number
}

export interface PaymentPolicy {
  type: 'FULL'
}

export interface CancellationPolicy {
  type: 'FULLY_REFUNDABLE'
}

export interface FeeTaxMandatory {
  isFeeMandatory: boolean
  isTaxMandatory: boolean
}

export interface Property {
  name: string
  id?: number
  altId: string // Vesta PMS Listing ID
  rooms: number
  bathrooms: number
  persons: number
  propertyType: PropertyType
  currency: 'USD'
  supportedLosRates: false
  // basePrice: number     // TODO: Add this to the property from the listing
  location?: PropertyLocation
  latitude?: number
  longitude?: number
  checkInTime?: string // HH:MM:SS
  checkOutTime?: string // HH:MM:SS
  policy: PropertyPolicy
  notes?: PropertyNotes
  attributesWithQuantity?: PropertyAmenity[]
  bedroomConfiguration: {
    bedrooms?: PropertyBedroom[]
  }
  basePrice: number
}

export interface PropertyResponse extends Property {
  id: number // ID returned from property in Booking Pal's system
}

export interface Fee {
  entityType: 'MANDATORY' | 'OPTIONAL' | 'MANDATORY_PAL'
  feeType: FeeType
  name: string
  unit: FeeUnit
  value: number
  valueType: FeeValueType
  taxType: FeeTaxType
  beginDate?: string
  endDate?: string
  option?: number
  altId?: string
}

export enum PropertyType {
  House = 'PCT34', // Vacation home
  Apartment = 'PCT3', // Apartment
  SecondaryUnit = 'PCT16', // Guesthouse
  BedAndBreakfast = 'PCT4', // Bed and breakfast
  BoutiqueHotel = 'PCT45', // Boutique hotel
  Condo = 'PCT8', // Condominium
}

export type FeeType = 'GENERAL' | 'PET_FEE' | 'DEPOSIT'
export type FeeUnit =
  | 'PER_STAY'
  | 'PER_DAY'
  | 'PER_PERSON'
  | 'PER_DAY_PER_PERSON'
  | 'PER_DAY_PER_PERSON_EXTRA'
export type FeeValueType = 'FLAT' | 'PERCENT'
export type FeeTaxType = 'TAXABLE' | 'NOT_TAXABLE'

export enum RequestToBookDeclineReasonType {
  NotAvailable = 'DATES_NOT_AVAILABLE',
  NotAGoodFit = 'NOT_A_GOOD_FIT',
  Waiting = 'WAITING_FOR_BETTER_RESERVATION',
  NotComfortable = 'NOT_COMFORTABLE',
}

export interface Taxes {
  name: string
  value: number
  altId?: string
}

export interface PropertyLocation {
  street: string
  city: string
  region: string // State (Region) of PM. Required for US properties.
  country: 'US' // # Country of property. Require 2 letter ISO code
  postalCode: string
  zipCode9: string // Set only for US properties (format should be zip5-xxxx)
}

export interface PropertyPolicy {
  petPolicy: PetPolicy
  internetPolicy: InternetPolicy
  parkingPolicy: ParkingPolicy
  childrenAllowed: boolean
  smokingAllowed: boolean
}

export interface PetPolicy {
  allowedPets: 'Allowed' | 'AllowedOnRequest' | 'NotAllowed'
}

export interface InternetPolicy {
  accessInternet: true
  kindOfInternet: 'WiFi' | 'Wired'
  availableInternet: 'AllAreas' | 'BusinessCenter' | 'SomeRooms'
  chargeInternet: string
}

export interface ParkingPolicy {
  accessParking: boolean
  locatedParking: 'OnSite' | 'Nearby'
  privateParking: boolean
  chargeParking: string
  timeCostParking: 'PerHour' | 'PerWeek' | 'PerStay' | 'PerDay'
  necessaryReservationParking:
    | 'NoReservationNeeded'
    | 'NotPossible'
    | 'ReservationNeeded'
}

export interface PropertyNotes {
  name: PropertyDescriptionText
  description: PropertyDescriptionText
  marketingName: PropertyDescriptionText
  houseRules?: PropertyDescriptionText
}

export interface PropertyDescriptionText {
  texts: PropertyText[]
}

export interface PropertyText {
  language: 'en' // Two letter ISO 639-1 code code, default to 'en'
  value: string
}

export interface PropertyAmenity {
  attributeId: string
  quantity: number
}

export interface PropertyBed {
  bedType: string
  count: number
}

export interface PropertyBedroom {
  beds: {
    bed: PropertyBed[]
  }
  type: string
  privateBathroom: boolean
}

export interface FeesAndTaxes {
  productId: number
  fees: Fee[]
  taxes: Taxes[]
}

export interface Availability {
  beginDate: string
  endDate: string
  availability: boolean
}

export type ChannelABB = 'BKG' | 'ABB' | 'EXP' | 'EXP_HC' | 'HAC'

export interface BpThreadsModel {
  threads: BpThread[]
}

export interface BpMessagesModel {
  messages: BpMessage[]
}

export interface BpImagesModel {
  images: BpImage[]
}

export interface BpThread {
  id: number
  lastMessageSentAt: string
  lastMessageText: string
  channelName: string
  channelABB: ChannelABB
  channelThreadId: string
  guestName: string
  productId: number
  reservationId?: number
  dateFrom: string
  dateTo: string
}

export interface BpMessage {
  id: number
  message: string
  createdAt: string
  user: MessageUser
  channelMessageId: string
}

export interface BpImage {
  url: string
  urlMbp: string
  sort: number
}

export interface BpReservationModel {
  reservationId: string
  productId: string
  supplierId: string
  channelName: string
  confirmationId: string
  uniqueKey: string
  newState: string
  customerName: string
  fromDate: string
  toDate: string
  adult: number
  child: number
  email: string
  phone: string
  total: number
  commission: { channelCommission: number; commission: number }
  fees: { id: string; name: string; value: number }[]
  rate: {
    netRate: number
    newPublishedRackRate: number
    originalRackRate: number
  }
  taxes: { id: string; name: string; value: number }[]
}
