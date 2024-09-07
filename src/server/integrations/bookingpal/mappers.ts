import type {
  Amenity,
  Bedroom,
  Content,
  Fee as ListingFee,
  Listing,
  Rules,
  UnitType,
  TaxRates,
  Availability,
} from '@prisma/client'
import { Channel } from '@prisma/client'
import {} from '@prisma/client'
import type {
  Property,
  PropertyLocation,
  PropertyNotes,
  PropertyPolicy,
  Fee,
  Taxes,
  PropertyBedroom,
  FeeType,
  PropertyBed,
} from './types'
import type { FeeUnit } from './types'
import { PropertyType } from './types'
import { titleCase } from 'utils/vesta'
import { DateTime } from 'luxon'
import type { Price } from 'server/services/rates/types'

export const mapListingToProperty = (
  listing: Listing,
  content: Content | null,
  rules: Rules | null,
  amenities: Amenity[],
  bedrooms: Bedroom[],
  basePrice: number,
  availability: Availability | null
): Property => {
  const result: Property = {
    name: listing.name,
    altId: listing.id,
    rooms: listing.beds,
    bathrooms: listing.baths,
    persons: listing.guests,
    propertyType: PROPERTY_TYPE_MAPPINGS[listing.unitType],
    currency: 'USD',
    supportedLosRates: false,
    location: mapListingToPropertyLocation(listing),
    policy: mapRulesToPropertyPolicy(rules),
    bedroomConfiguration: {
      bedrooms: bedrooms.map(mapBedroom),
    },
    basePrice: basePrice,
  }

  if (availability) {
    result.checkInTime = formatTime(availability.checkIn)
    result.checkOutTime = formatTime(availability.checkOut)
  }

  if (content) {
    result.notes = mapContentToNotes(content, rules)
  }

  if (listing.latitude && listing.longitude) {
    result.latitude = listing.latitude
    result.longitude = listing.longitude
  }

  result.attributesWithQuantity = amenities.flatMap((amenity) => {
    return amenity.typeId.split(',').map((typeId) => {
      return {
        attributeId: typeId,
        quantity: 1,
      }
    })
  })

  return result
}

// time is of the format (H:MM
const formatTime = (time: string) => {
  return DateTime.fromFormat(time, 'H:mm').toFormat('HH:mm:ss')
}

const mapBedroom = (bedroom: Bedroom): PropertyBedroom => {
  const beds: PropertyBed[] = mapBeds(bedroom.beds)

  return {
    beds: {
      bed: beds,
    },
    type: bedroom.type,
    privateBathroom: bedroom.bathroom,
  }
}

const mapBeds = (beds: string[]): PropertyBed[] => {
  const counts: { [key: string]: number } = {}

  beds.forEach((bed) => {
    if (counts[bed]) {
      counts[bed]++
    } else {
      counts[bed] = 1
    }
  })

  const result: PropertyBed[] = []

  for (const key in counts) {
    result.push({
      bedType: key,
      count: counts[key],
    })
  }

  return result
}

const mapListingToPropertyLocation = (listing: Listing): PropertyLocation => {
  let street = listing.line1
  if (listing.line2) {
    street = `${street}, ${listing.line2}`
  }

  return {
    street: street,
    city: listing.city,
    region: listing.state,
    country: 'US',
    postalCode: listing.zip,
    zipCode9: listing.zip,
  }
}

const mapRulesToPropertyPolicy = (rules: Rules | null): PropertyPolicy => {
  if (!rules) {
    return DEFAULT_PROPERTY_POLICY
  }

  const result: PropertyPolicy = {
    petPolicy: {
      allowedPets: rules.pets ? 'Allowed' : 'NotAllowed',
    },
    childrenAllowed: rules.children ?? false,
    smokingAllowed: rules.smoking ?? false,
    internetPolicy: {
      ...DEFAULT_PROPERTY_POLICY.internetPolicy,
      chargeInternet: '$25',
    },
    parkingPolicy: {
      ...DEFAULT_PROPERTY_POLICY.parkingPolicy,
    },
  }

  return result
}

export const mapContentToNotes = (
  content: Content,
  rules: Rules | null
): PropertyNotes => {
  const result: PropertyNotes = {
    name: {
      texts: [
        {
          language: 'en',
          value: content.title,
        },
      ],
    },
    description: {
      texts: [
        {
          language: 'en',
          value: content.description,
        },
      ],
    },
    marketingName: {
      texts: [
        {
          language: 'en',
          value: content.title,
        },
      ],
    },
  }

  if (rules && rules.house) {
    result.houseRules = {
      texts: [
        {
          language: 'en',
          value: rules.house,
        },
      ],
    }
  }

  return result
}

export const mapTaxRatesToTaxes = (taxRates: TaxRates | null): Taxes[] => {
  const result: Taxes[] = []
  if (taxRates === null) {
    return result
  }

  const rates: [string, number][] = [
    ['municipal', taxRates.municipal ?? 0],
    ['county', taxRates.county ?? 0],
    ['state', taxRates.state ?? 0],
  ]

  for (const [jurisdiction, rate] of rates) {
    result.push({
      name: `${titleCase(jurisdiction)} tax`,
      value: rate,
      altId: `${taxRates.id}-${jurisdiction}`,
    })
  }

  return result
}

export const mapListingFeesToFees = (listingFees: ListingFee[]): Fee[] => {
  const result: Fee[] = listingFees.map((fee) => {
    return {
      entityType: 'MANDATORY',
      feeType: FEE_TYPE_MAPPINGS[fee.type],
      name: fee.name,
      unit: FEE_UNIT_MAPPINGS[fee.unit],
      value: fee.value,
      valueType: 'FLAT',
      taxType: fee.taxable ? 'TAXABLE' : 'NOT_TAXABLE',
      altId: fee.id,
    }
  })

  return result
}

export const mapPricing = (
  productId: number,
  prices: Price[],
  maxStay: number
) => {
  const today = DateTime.local() // Today's date
  const threeYearsFromNow = today.plus({ years: 3 }) // Date three years from now

  const priceData = {
    productId,
    rates: prices.map((price) => {
      return {
        beginDate: price.date.toString(),
        endDate: price.date.toString(),
        amount: price.price,
      }
    }),
    minStays: prices.map((price) => {
      return {
        beginDate: price.date.toString(),
        endDate: price.date.toString(),
        minStay: price.minStay,
      }
    }),
    maxStays: [
      {
        beginDate: today.toISODate(),
        endDate: threeYearsFromNow.toISODate(),
        maxStay: maxStay,
      },
    ],
  }

  return priceData
}

const FEE_TYPE_MAPPINGS: Record<string, FeeType> = {
  CleaningFee: 'GENERAL',
  PetFee: 'PET_FEE',
  General: 'GENERAL',
  Deposit: 'DEPOSIT',
}

const FEE_UNIT_MAPPINGS: Record<string, FeeUnit> = {
  PerStay: 'PER_STAY',
  PerDay: 'PER_DAY',
  PerPerson: 'PER_PERSON',
  PerDayPerPerson: 'PER_DAY_PER_PERSON',
  PerDayPerPersonExtra: 'PER_DAY_PER_PERSON_EXTRA',
}

const PROPERTY_TYPE_MAPPINGS: Record<UnitType, PropertyType> = {
  House: PropertyType.House,
  Apartment: PropertyType.Apartment,
  Condo: PropertyType.Condo,
  SecondaryUnit: PropertyType.SecondaryUnit,
  BedAndBreakfast: PropertyType.BedAndBreakfast,
  BoutiqueHotel: PropertyType.BoutiqueHotel,
}

const DEFAULT_PROPERTY_POLICY: PropertyPolicy = {
  petPolicy: {
    allowedPets: 'NotAllowed',
  },
  childrenAllowed: false,
  smokingAllowed: false,
  internetPolicy: {
    accessInternet: true,
    kindOfInternet: 'WiFi',
    availableInternet: 'AllAreas',
    chargeInternet: '$25',
  },
  parkingPolicy: {
    accessParking: true,
    locatedParking: 'OnSite',
    privateParking: true,
    chargeParking: 'Free',
    timeCostParking: 'PerStay',
    necessaryReservationParking: 'NoReservationNeeded',
  },
}

export const mapEventToAvailabilities = (
  event: [begin: Date, end: Date],
  availability: boolean
) => {
  const beginDate = DateTime.fromJSDate(event[0]).startOf('day')
  const endDate = DateTime.fromJSDate(event[1]).startOf('day')
  const daysBetween = endDate.diff(beginDate, 'days').days

  return Array.from({ length: daysBetween }, (_, index) => {
    const currentDate = beginDate.plus({ days: index })
    return {
      beginDate: currentDate.toISODate(),
      endDate: currentDate.toISODate(),
      availability,
    }
  })
}

const CHANNEL_MAPPINGS: Record<Uppercase<string>, Channel> = {
  AIRBNB: Channel.Airbnb,
  VRBO: Channel.VRBO,
  BOOKING: Channel.Booking,
}

export const mapChannel = (channelName: string) => {
  // See https://github.com/microsoft/TypeScript/issues/44268 on why this has to be casted
  const upcase = channelName.toUpperCase() as Uppercase<string>
  return CHANNEL_MAPPINGS[upcase]
}
