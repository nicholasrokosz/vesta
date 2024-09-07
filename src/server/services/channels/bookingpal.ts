import type {
  Amenity,
  Availability,
  Bedroom,
  Content,
  Listing,
  Prisma,
  Rules,
  Fee as ListingFee,
  TaxRates,
} from '@prisma/client'
import { mapChannel } from 'server/integrations/bookingpal/mappers'
import type PropertyManagmentCompanyApi from 'server/integrations/bookingpal/pmc'
import type { RequestToBookDeclineReasonType } from 'server/integrations/bookingpal/types'
import type { Price } from '../rates/types'
export class BookingPalService {
  constructor(
    private readonly prisma: Prisma.TransactionClient,
    private readonly organizationId: string,
    private readonly pmc: PropertyManagmentCompanyApi
  ) {}

  private async getToken(ownerId: string | null) {
    let bookingPalConnection = null

    if (ownerId)
      bookingPalConnection = await this.prisma.bookingPalConnection.findUnique({
        where: {
          ownerId,
        },
      })

    if (!bookingPalConnection)
      bookingPalConnection = await this.prisma.bookingPalConnection.findUnique({
        where: {
          organizationId: this.organizationId,
        },
      })

    if (!bookingPalConnection) {
      throw new Error(
        'Neither Organization or owner has a bookingpal connection.'
      )
    }
    const token = await this.pmc.getToken(bookingPalConnection)

    if (!token) {
      throw new Error('Error retrieving bookingpal token.')
    }

    return token
  }

  async getProductId(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return null
    }

    return listing.bpProductId
  }

  async sendAvailability(
    listingId: string,
    event: [begin: Date, end: Date],
    available: boolean,
    ownerId: string | null
  ) {
    const productId = await this.getProductId(listingId)

    if (available) {
      await this.pmc.createAvailable(
        await this.getToken(ownerId),
        Number(productId),
        event
      )
    } else {
      await this.pmc.createUnavailable(
        await this.getToken(ownerId),
        Number(productId),
        event
      )
    }
  }

  async sendMessage(
    bpThreadId: string,
    message: string,
    ownerId: string | null
  ) {
    await this.pmc.sendMessage(
      await this.getToken(ownerId),
      Number(bpThreadId),
      message
    )
  }

  async getThreads() {
    // Get threads for the organization
    const bpThreads = await this.pmc.getMessageThreads(
      await this.getToken(null)
    )

    // Get threads for co-hosts
    const owners = await this.prisma.user.findMany({
      where: {
        organizationRole: 'PROPERTY_OWNER',
        organizationId: this.organizationId,
        bookingPalConnection: { isNot: null },
      },
    })

    await Promise.all(
      owners.map(async (owner) => {
        const threads = await this.pmc.getMessageThreads(
          await this.getToken(owner.id)
        )
        bpThreads.push(...threads)
      })
    )

    const threads = bpThreads.map((thread) => {
      return {
        bpThreadId: thread.id.toString(),
        productId: thread.productId.toString(),
        guestName: thread.guestName,
        channel: mapChannel(thread.channelName),
        lastMessageSentAt: thread.lastMessageSentAt,
        channelThreadId: thread.channelThreadId,
        dateFrom: thread.dateFrom,
        dateTo: thread.dateTo,
        bpReservationId: thread.reservationId
          ? thread.reservationId.toString()
          : undefined,
      }
    })

    return threads
  }

  async getMessages(bpThreadId: string, ownerId: string | null) {
    const messages = await this.pmc.getMessages(
      await this.getToken(ownerId),
      Number(bpThreadId)
    )

    return messages.map((message) => {
      return {
        bpMessageId: message.id.toString(),
        message: message.message,
        timestamp: new Date(message.createdAt),
        channelMessageId: message.channelMessageId,
        user: message.user,
      }
    })
  }

  async sendAvailabilities(
    productId: number,
    availabilities: {
      beginDate: string
      endDate: string
      availability: boolean
    }[],
    ownerId: string | null
  ) {
    await this.pmc.createAvailabilities(
      await this.getToken(ownerId),
      productId,
      availabilities
    )
  }

  async createUnavailable(
    productId: number,
    event: [begin: Date, end: Date],
    ownerId: string | null
  ) {
    await this.pmc.createUnavailable(
      await this.getToken(ownerId),
      productId,
      event
    )
  }

  async createAvailable(
    productId: number,
    event: [begin: Date, end: Date],
    ownerId: string | null
  ) {
    await this.pmc.createAvailable(
      await this.getToken(ownerId),
      productId,
      event
    )
  }

  async respondToRequestToBook(
    reservationId: number,
    accept: boolean,
    denyReason: RequestToBookDeclineReasonType | undefined,
    declineMessage: string | undefined,
    ownerId: string | null
  ) {
    await this.pmc.respondToRequestToBook(
      await this.getToken(ownerId),
      reservationId,
      accept,
      denyReason,
      declineMessage
    )
  }

  async updateProperty(
    listing: Listing,
    content: Content | null,
    rules: Rules | null,
    amenities: Amenity[],
    rooms: Bedroom[],
    basePrice: number,
    availability: Availability | null,
    ownerId: string | null
  ) {
    await this.pmc.updateProperty(
      await this.getToken(ownerId),
      listing,
      content,
      rules,
      amenities,
      rooms,
      basePrice,
      availability
    )
  }

  async createProperty(
    listing: Listing,
    content: Content | null,
    rules: Rules | null,
    amenities: Amenity[],
    rooms: Bedroom[],
    basePrice: number,
    availability: Availability | null,
    ownerId: string | null
  ) {
    const property = await this.pmc.createProperty(
      await this.getToken(ownerId),
      listing,
      content,
      rules,
      amenities,
      rooms,
      basePrice,
      availability
    )
    return property
  }

  async updateImages(
    productId: number,
    images: string[],
    ownerId: string | null
  ) {
    const result = await this.pmc.updateImages(
      await this.getToken(ownerId),
      productId,
      images
    )
    return result
  }

  async updateFeesAndTaxes(
    productId: number,
    listingFees: ListingFee[],
    taxRates: TaxRates | null,
    ownerId: string | null
  ) {
    await this.pmc.updateFeesAndTaxes(
      await this.getToken(ownerId),
      productId,
      listingFees,
      taxRates
    )
  }

  async updatePricing(
    productId: number,
    prices: Price[],
    maxStay: number,
    ownerId: string | null
  ) {
    await this.pmc.updatePricing(
      await this.getToken(ownerId),
      productId,
      prices,
      maxStay
    )
  }

  async activateProperty(listing: Listing) {
    await this.pmc.activateProperty(
      await this.getToken(listing.propertyOwnerId),
      listing
    )
  }

  async validateProperty(productId: number, ownerId: string | null) {
    await this.pmc.validateProperty(await this.getToken(ownerId), productId)
  }

  async updateLengthOfStayDiscounts(
    productId: number,
    discounts: {
      days: number
      percent: number
    }[],
    ownerId: string | null
  ) {
    return this.pmc.sendYield(
      await this.getToken(ownerId),
      productId,
      discounts
    )
  }

  async getPhotos(listingId: string) {
    const productId = (await this.getProductId(listingId)) as string

    const images = await this.pmc.getImages(
      await this.getToken(null),
      Number(productId)
    )

    const photoUrls = images
      .sort((a, b) => a.sort - b.sort)
      .map((bpImage) => bpImage.url)

    return photoUrls
  }

  async getReservations(listingId: string) {
    const productId = (await this.getProductId(listingId)) as string

    const reservations = await this.pmc.getReservations(
      await this.getToken(null),
      Number(productId)
    )

    return reservations
  }
}

export default BookingPalService
