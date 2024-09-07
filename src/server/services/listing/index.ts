import { prisma } from 'server/db'
import PropertyManagmentCompanyApi from 'server/integrations/bookingpal/pmc'
import type {
  Listing,
  BusinessModel,
  Notes,
  ListingWithDirectBookingKey,
} from 'types/listings'
import { geocodeAddress } from 'server/integrations/google/geocode'
import BookingPalService from '../channels/bookingpal'
import ServiceFactory from '../serviceFactory'
import { nanoid } from 'nanoid'
import { KeyType, type Organization } from '@prisma/client'

const pmc = new PropertyManagmentCompanyApi()

class ListingService {
  // ** GET **
  async getOne(id: string) {
    const listing = await prisma.listing.findFirst({
      where: {
        id,
      },
      include: {
        availability: true,
        amenities: true,
        content: true,
        propertyManager: true,
        propertyOwner: true,
        messageTemplates: true,
        pricing: {
          include: {
            discounts: { select: { days: true, percent: true } },
          },
        },
        rules: true,
      },
    })

    if (!listing) return null

    const iCalUrl =
      process.env.APP_URL && listing?.iCalKey
        ? `${process.env.APP_URL}/api/icalendar/${listing?.iCalKey}`
        : undefined

    return { ...listing, iCalUrl }

    // return listing
  }

  async getByBpProductId(bpProductId: string) {
    const listing = await prisma.listing.findUnique({
      where: {
        bpProductId,
      },
    })

    return listing
  }

  async getByKey(key: string) {
    const listingKey = await prisma.listingKey.findUniqueOrThrow({
      where: { id: key },
      include: { listing: { include: { organization: true } } },
    })

    return listingKey.listing
  }

  async isCohost(id: string) {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        propertyOwner: { include: { bookingPalConnection: true } },
      },
    })

    return !!listing.propertyOwner?.bookingPalConnection
  }

  async getPm(id: string) {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id,
      },
      select: { propertyManager: { include: { organization: true } } },
    })

    return listing.propertyManager
  }

  async getAllByOrganization(organizationId: string) {
    return prisma.listing.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        content: { select: { photos: true } },
        keys: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  async getAllByOwner(ownerId: string) {
    return prisma.listing.findMany({
      where: {
        propertyOwnerId: ownerId,
      },
      include: { content: true },
    })
  }

  async getAll() {
    return prisma.listing.findMany({
      include: {
        amenities: true,
        propertyOwner: true,
        content: { select: { photos: true } },
      },
    })
  }

  async getDetails(id: string) {
    return await prisma.listing.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        unitType: true,
        beds: true,
        baths: true,
        guests: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        latitude: true,
        longitude: true,
        timeZone: true,
        propertyManagerId: true,
        propertyOwnerId: true,
        wifiName: true,
        wifiPassword: true,
        notes: true,
        doorCode: true,
        url: true,
        basePrice: true,
      },
    })
  }

  async getReview(id: string) {
    return await prisma.listing.findFirst({
      where: {
        id,
      },
      include: {
        content: { include: { bedrooms: true } },
        rules: true,
        amenities: true,
        fees: true,
        taxRates: true,
        pricing: true,
        availability: true,
      },
    })
  }

  async upsertListing(listing: Listing, organizationId: string) {
    const geocode = await geocodeAddress(
      listing.line1,
      listing.line2 || '',
      listing.city,
      listing.state,
      listing.zip
    )

    if (geocode && geocode.length > 0) {
      listing.latitude = geocode[0].latitude
      listing.longitude = geocode[0].longitude
    }

    if (!listing.iCalKey) {
      listing.iCalKey = nanoid()
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    })

    const result = await prisma.listing.upsert({
      where: { id: listing.id || '' },
      update: listing,
      create: {
        ...listing,
        organizationId,
        keys: {
          create: org?.directBooking ? { keyType: 'Direct' } : undefined,
        },
      },
    })
    return result.id
  }

  async upsertBusinessModel({
    listingId,
    deductions,
    taxRates,
    fees,
    airbnbRemitsTaxes,
  }: BusinessModel) {
    await prisma.listing.update({
      where: {
        id: String(listingId),
      },
      data: {
        fees: {
          deleteMany: {},
        },
      },
    })

    await prisma.listing.update({
      where: {
        id: String(listingId),
      },
      data: {
        airbnbRemitsTaxes,
        fees: { createMany: { data: fees } },
      },
    })

    await prisma.taxRates.upsert({
      where: {
        listingId: String(listingId),
      },
      update: taxRates,
      create: {
        ...taxRates,
        listingId: String(listingId),
      },
    })

    await prisma.deductions.upsert({
      where: {
        listingId: String(listingId),
      },
      update: deductions,
      create: deductions,
    })
  }

  async getBusinessModel(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      select: {
        airbnbRemitsTaxes: true,
        fees: {
          select: {
            id: true,
            name: true,
            share: true,
            taxable: true,
            type: true,
            unit: true,
            value: true,
          },
        },
        taxRates: true,
        deductions: true,
      },
    })

    if (!listing) return

    const { fees, taxRates, deductions, airbnbRemitsTaxes } = listing

    return {
      fees,
      taxRates,
      deductions,
      airbnbRemitsTaxes,
    }
  }

  async getBusinessModelForRevenue(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      select: {
        airbnbRemitsTaxes: true,
        fees: {
          select: {
            id: true,
            name: true,
            share: true,
            taxable: true,
            type: true,
            unit: true,
            value: true,
          },
        },
        taxRates: true,
        deductions: true,
      },
    })

    if (!listing || !listing.fees || !listing.taxRates || !listing.deductions)
      return

    const { fees, taxRates, deductions, airbnbRemitsTaxes } = listing

    return {
      fees,
      taxRates,
      deductions,
      airbnbRemitsTaxes,
    }
  }

  async upsertNotes({ listingId, notes }: Notes) {
    await prisma.listing.update({
      where: {
        id: String(listingId),
      },
      data: {
        notes: notes,
      },
    })
  }

  // ** PUBLISH **
  async publishPropertyInBookingPal(listingId: string) {
    const listing = await this.getReview(listingId)

    if (!listing) {
      throw new Error('Listing not found.')
    }
    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )

    if (listing.bpProductId) {
      await channelService.updateProperty(
        listing,
        listing.content,
        listing.rules,
        listing.amenities,
        listing.content?.bedrooms ?? [],
        listing.basePrice,
        listing.availability,
        listing.propertyOwnerId
      )
    } else {
      const property = await channelService.createProperty(
        listing,
        listing.content,
        listing.rules,
        listing.amenities,
        listing.content?.bedrooms ?? [],
        listing.basePrice,
        listing.availability,
        listing.propertyOwnerId
      )
      if (!listing.bpProductId) {
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            bpProductId: property.id.toString(),
          },
        })
      }
    }
  }

  async publishPhotos(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem publishing photos.')
    }

    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )

    const result = await channelService.updateImages(
      Number(listing.bpProductId),
      listing.content?.photos ?? [],
      listing.propertyOwnerId
    )

    return result
  }

  async publishFeesAndTaxes(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        fees: true,
        taxRates: true,
      },
    })

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem publishing fees and taxes.')
    }

    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )
    await channelService.updateFeesAndTaxes(
      Number(listing.bpProductId),
      listing.fees,
      listing.taxRates,
      listing.propertyOwnerId
    )
  }

  async publishPricing(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem publishing pricing.')
    }

    const factory = await ServiceFactory.fromListingId(prisma, listingId)
    const ratesService = factory.getRatesService()
    const prices = await ratesService.getFuturePrices(listingId)
    const pricing = await ratesService.getPricing(listingId)

    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )

    await channelService.updatePricing(
      Number(listing.bpProductId),
      prices,
      pricing?.maxStay ?? 30,
      listing.propertyOwnerId
    )
  }

  async publishAvailability(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem publishing availability.')
    }

    // Send all availability to BookingPal
    const factory = await ServiceFactory.fromListingId(prisma, listingId)
    const channelService = factory.getBookingPalService()

    const availabilities = await factory
      .getCalendarService()
      .getAvailabilitiesByListing(listingId)
    await channelService.sendAvailabilities(
      Number(listing.bpProductId),
      availabilities,
      listing.propertyOwnerId
    )
  }

  async activateProperty(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing) {
      throw new Error('Listing not found.')
    }

    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )
    await channelService.activateProperty(listing)
  }

  async validateProperty(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem validating listing.')
    }

    const channelService = new BookingPalService(
      prisma,
      listing.organizationId,
      pmc
    )
    await channelService.validateProperty(
      Number(listing.bpProductId),
      listing.propertyOwner?.id ?? null
    )
  }

  async publishLengthOfStayDiscounts(listingId: string) {
    const listing = await this.getOne(listingId)

    if (!listing || !listing.bpProductId) {
      throw new Error('Problem publishing length of stay discounts.')
    }

    if (listing.pricing?.discounts && listing.pricing?.discounts.length > 0) {
      const channelService = new BookingPalService(
        prisma,
        listing.organizationId,
        pmc
      )

      await channelService.updateLengthOfStayDiscounts(
        Number(listing.bpProductId),
        listing.pricing.discounts,
        listing.propertyOwnerId
      )
    }
  }

  async getListingsWithDirectBookingKeys(
    organization: Organization
  ): Promise<ListingWithDirectBookingKey[]> {
    if (!organization.directBooking) {
      return []
    }

    const listings = await prisma.listing.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        keys: {
          where: {
            keyType: KeyType.Direct,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return listings
      .map((listing) => {
        const key = listing.keys[0]
        return {
          id: listing.id,
          name: listing.name,
          key: key.id,
          keyType: key.keyType,
          widgetUrl: `${process.env.APP_URL || ''}/direct/widget?key=${key.id}`,
        }
      })
      .filter(Boolean)
  }
}

export default ListingService
