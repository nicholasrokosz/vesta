import type { Company, CompanyResponse } from './types'
import type { Token } from './bookingPalHttpClient'
import BookingPalHttpClient from './bookingPalHttpClient'

export type SupplierToken = Token & { __brand: 'SupplierToken' }

class BookingPalSupplierApi extends BookingPalHttpClient<SupplierToken> {
  private supplierUsername: string
  private supplierPassword: string

  public constructor() {
    super()

    this.supplierUsername = process.env.BOOKING_PAL_USERNAME ?? ''
    this.supplierPassword = process.env.BOOKING_PAL_PASSWORD ?? ''
  }

  public async getToken() {
    return await this.getLoginToken(
      this.supplierUsername,
      this.supplierPassword
    )
  }

  public async getPropertyManagers(token: SupplierToken) {
    const response = await this.sendRequest<CompanyResponse>(token, {
      caller: 'getPropertyManagers',
      endpoint: '/pmlist',
      method: 'GET',
    })

    return response
  }

  public async createPropertyManager(token: SupplierToken, company: Company) {
    const response = await this.sendRequest<CompanyResponse>(token, {
      caller: 'createPropertyManager',
      method: 'POST',
      endpoint: '/pm',
      data: company,
    })

    return response[0]
  }

  public async updatePropertyManager(
    token: SupplierToken,
    companyId: number,
    company: Company
  ) {
    const response = await this.sendRequest<CompanyResponse>(token, {
      caller: 'updatePropertyManager',
      method: 'PUT',
      endpoint: `/pm/${companyId}`,
      data: company,
    })

    return response[0]
  }
}

export default BookingPalSupplierApi
