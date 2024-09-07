import PriceLabsHttpClient from './priceLabsHttpClient'
import type {
  CalendarSyncRequest,
  IntegrationParams,
  Listing,
  ReservationSyncRequest,
  ListingResponse,
  CalendarResponse,
  ReservationResponse,
  GetPricesResponse,
} from './types'

class PriceLabsApi extends PriceLabsHttpClient {
  public constructor() {
    super()
  }

  public async integration(data: IntegrationParams) {
    return await this.sendRequest<IntegrationParams>({
      caller: 'integration',
      endpoint: 'integration',
      method: 'POST',
      data: {
        integration: data,
      },
    })
  }

  public async listingsSync(listings: Listing[]) {
    return await this.sendRequest<ListingResponse>({
      caller: 'listingsSync',
      endpoint: 'listings',
      method: 'POST',
      data: {
        listings,
      },
    })
  }

  public async calendarSync(calendars: CalendarSyncRequest[]) {
    return await this.sendRequest<CalendarResponse>({
      caller: 'calendarSync',
      endpoint: 'calendar',
      method: 'POST',
      data: {
        calendars,
      },
    })
  }

  public async reservationsSync(reservations: ReservationSyncRequest[]) {
    return await this.sendRequest<ReservationResponse>({
      caller: 'reservationsSync',
      endpoint: 'reservations',
      method: 'POST',
      data: {
        reservations,
      },
    })
  }

  public async getPrices(listing_id: string): Promise<GetPricesResponse> {
    return await this.sendRequest<GetPricesResponse>({
      caller: 'getPrices',
      endpoint: 'get_prices',
      method: 'POST',
      data: {
        sync: {
          listing_id: listing_id,
        },
      },
    })
  }
}

export default PriceLabsApi
