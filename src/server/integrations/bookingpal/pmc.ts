import type {
  Amenity,
  Availability,
  Bedroom,
  BookingPalConnection,
  Content,
  Fee as ListingFee,
  Listing,
  Rules,
  TaxRates,
} from '@prisma/client'
import type { Token } from './bookingPalHttpClient'
import BookingPalHttpClient from './bookingPalHttpClient'
import type {
  Property,
  PropertyResponse,
  RequestToBookDeclineReasonType,
  BpThreadsModel,
  BpMessagesModel,
  BpImagesModel,
  BpReservationModel,
} from './types'
import {
  mapListingToProperty,
  mapListingFeesToFees,
  mapTaxRatesToTaxes,
  mapEventToAvailabilities,
  mapPricing,
} from './mappers'
import type { Price } from 'server/services/rates/types'

export type PmcToken = Token & { __brand: 'PmcToken' }

class PropertyManagmentCompanyApi extends BookingPalHttpClient<PmcToken> {
  public constructor() {
    super()
  }

  public async getToken(
    bookingPalConnection: BookingPalConnection
  ): Promise<PmcToken> {
    return await this.getLoginToken(
      bookingPalConnection.email,
      bookingPalConnection.password
    )
  }

  public async createProperty(
    token: PmcToken,
    listing: Listing,
    content: Content | null,
    rules: Rules | null,
    amenities: Amenity[],
    rooms: Bedroom[],
    basePrice: number,
    availability: Availability | null
  ) {
    const property: Property = mapListingToProperty(
      listing,
      content,
      rules,
      amenities,
      rooms,
      basePrice,
      availability
    )

    const response = await this.sendRequest<PropertyResponse>(token, {
      caller: 'createProperty',
      method: 'POST',
      endpoint: '/product',
      data: property,
    })

    return response[0]
  }

  public async updateProperty(
    token: PmcToken,
    listing: Listing,
    content: Content | null,
    rules: Rules | null,
    amenities: Amenity[],
    rooms: Bedroom[],
    basePrice: number,
    availability: Availability | null
  ) {
    const property: Property = mapListingToProperty(
      listing,
      content,
      rules,
      amenities,
      rooms,
      basePrice,
      availability
    )

    property.id = Number(listing.bpProductId)

    const response = await this.sendRequest<PropertyResponse>(token, {
      caller: 'updateProperty',
      method: 'PUT',
      endpoint: '/product',
      data: property,
    })

    return response[0]
  }

  public async activateProperty(token: PmcToken, listing: Listing) {
    const listingId = [Number(listing.bpProductId)] as number[]

    return await this.sendRequest<undefined>(token, {
      caller: 'activateProperty',
      method: 'POST',
      endpoint: '/product/activation',
      data: listingId,
    })
  }

  public async updateFeesAndTaxes(
    token: PmcToken,
    productId: number,
    listingFees: ListingFee[],
    taxRates: TaxRates | null
  ) {
    const data = {
      productId,
      fees: mapListingFeesToFees(listingFees),
      taxes: mapTaxRatesToTaxes(taxRates),
    }

    return await this.sendRequest<undefined>(token, {
      caller: 'updateFeesAndTaxes',
      method: 'POST',
      endpoint: '/taxfee',
      data: data,
    })
  }

  public async updateImages(
    token: PmcToken,
    productId: number,
    images: string[]
  ) {
    const data = {
      productId,
      images: images.map((image) => {
        return {
          url: image,
        }
      }),
    }

    await this.sendRequest<undefined>(token, {
      caller: 'updateImages',
      method: 'PUT',
      endpoint: '/image',
      data: data,
    })
  }

  public async updatePricing(
    token: PmcToken,
    productId: number,
    prices: Price[],
    maxStay: number
  ) {
    const priceData = mapPricing(productId, prices, maxStay)

    await this.sendRequest<undefined>(token, {
      caller: 'updatePricing',
      method: 'POST',
      endpoint: '/ra',
      data: priceData,
    })
  }

  public async createAvailabilities(
    token: PmcToken,
    productId: number,
    availabilities: {
      beginDate: string
      endDate: string
      availability: boolean
    }[]
  ) {
    const data = {
      productId,
      availabilities,
    }

    await this.sendRequest<undefined>(token, {
      caller: 'createAvailabilities',
      method: 'POST',
      endpoint: '/ra',
      data: data,
    })
  }

  public async createUnavailable(
    token: PmcToken,
    productId: number,
    event: [begin: Date, end: Date]
  ) {
    const data = {
      productId,
      availabilities: mapEventToAvailabilities(event, false),
    }

    await this.sendRequest<undefined>(token, {
      caller: 'createUnavailable',
      method: 'POST',
      endpoint: '/ra',
      data: data,
    })
  }

  public async createAvailable(
    token: PmcToken,
    productId: number,
    event: [begin: Date, end: Date]
  ) {
    const data = {
      productId,
      availabilities: mapEventToAvailabilities(event, true),
    }

    await this.sendRequest<undefined>(token, {
      caller: 'createAvailable',
      method: 'POST',
      endpoint: '/ra',
      data: data,
    })
  }

  public async respondToRequestToBook(
    token: PmcToken,
    reservationId: number,
    accept: boolean,
    denyReason: RequestToBookDeclineReasonType | undefined,
    declineMessage: string | undefined
  ) {
    const data = {
      requestToBookType: accept ? 'ACCEPT' : 'DENY',
      reservationId,
      ...(accept
        ? {}
        : {
            requestToBookDeclineReasonType: denyReason,
            declineMessageToGuest: declineMessage,
          }),
    }

    await this.sendRequest<undefined>(token, {
      caller: 'respondToRequestToBook',
      method: 'POST',
      // TODO: Make this an environment variable
      //'/requestToBook',
      endpoint: '/requestToBookTest',
      data: data,
    })
  }

  public async validateProperty(token: PmcToken, productId: number) {
    const data = {
      productIds: [productId],
    }

    await this.sendRequest<undefined>(token, {
      caller: 'validateProperty',
      method: 'POST',
      endpoint: '/validation',
      data: data,
    })
  }

  public async getMessageThreads(token: PmcToken) {
    const response = await this.sendRequest<BpThreadsModel>(token, {
      caller: 'getMessageThreads',
      endpoint: '/message/allthreads/all',
      method: 'GET',
      query: [
        ['page', '1'],
        ['limit', '50'],
      ],
    })

    return response[0].threads
  }

  public async getMessages(token: PmcToken, threadId: number) {
    const response = await this.sendRequest<BpMessagesModel>(token, {
      caller: 'getMessages',
      endpoint: `/message/specificthread/${threadId}`,
      method: 'GET',
    })

    return response[0].messages
  }

  public async sendMessage(token: PmcToken, threadId: number, message: string) {
    const data = {
      threadId,
      message,
    }

    await this.sendRequest<undefined>(token, {
      caller: 'sendMessage',
      method: 'POST',
      endpoint: '/message',
      data: data,
    })
  }

  public async sendYield(
    token: PmcToken,
    productId: number,
    discounts: {
      percent: number
      days: number
    }[]
  ) {
    const data = {
      productId,
      lengthOfStay: discounts.map((discount) => {
        return {
          beginDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 2)
          )
            .toISOString()
            .slice(0, 10),
          amount: discount.percent,
          modifier: 'DECREASE_PERCENT',
          param: discount.days,
        }
      }),
    }

    await this.sendRequest<undefined>(token, {
      caller: 'sendYield',
      method: 'POST',
      endpoint: '/yield',
      data: data,
    })
  }

  public async getImages(token: PmcToken, productId: number) {
    const response = await this.sendRequest<BpImagesModel>(token, {
      caller: 'getImages',
      endpoint: `/image/${productId}`,
      method: 'GET',
    })

    return response[0].images
  }

  public async getReservations(token: PmcToken, productId: number) {
    const response = await this.sendRequest<BpReservationModel>(token, {
      caller: 'getReservations',
      endpoint: `/reservation/${productId}`,
      method: 'GET',
    })

    return response
  }
}

export default PropertyManagmentCompanyApi
