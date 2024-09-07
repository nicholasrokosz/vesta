import type { AxiosError } from 'axios'
import axios from 'axios'
import HttpClient from 'utils/http-client'

export type Token = string

interface GetMasterTokenResponse {
  master_token: string
  refresh_token: string
}

interface GetWizardTokenResponse {
  pm_scoped_temp_token: string
}

export type BookingPalRequest = {
  caller: string
  endpoint: string
  method: 'POST'
  data: unknown
}

class WizardClient<T extends Token> extends HttpClient {
  private supplierUsername: string
  private supplierPassword: string

  constructor() {
    super(process.env.BOOKING_PAL_BASE_URI ?? '')
    const apiKey = process.env.BOOKING_PAL_API_KEY ?? ''
    this.supplierUsername = process.env.BOOKING_PAL_USERNAME ?? ''
    this.supplierPassword = process.env.BOOKING_PAL_PASSWORD ?? ''

    this.instance.defaults.headers.common['x-api-key'] = apiKey
  }

  private async getMasterToken(): Promise<T> {
    const data = {
      username: this.supplierUsername,
      password: this.supplierPassword,
    }

    try {
      const response = await this.instance.post<GetMasterTokenResponse>(
        '/auth/token',
        data
      )

      return response.master_token as T
    } catch (e) {
      const error = e as Error | AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(axiosError.response.data);
          console.log(axiosError.response.status)
          console.log(axiosError.response.headers)
        } else if (axiosError.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(axiosError.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', axiosError.message)
        }
        // Access to config, request, and response
      } else {
        // Just a stock error
        console.error('non-AxiosError')
      }

      throw error
    }
  }

  async getWizardToken(pmId: string): Promise<T> {
    const masterToken = await this.getMasterToken()
    const data = {
      master_token: masterToken,
      pm_id: pmId,
    }

    try {
      const response = await this.instance.post<GetWizardTokenResponse>(
        '/auth/token/get_pm_cred_by_pms_id',
        data
      )

      return response.pm_scoped_temp_token as T
    } catch (e) {
      const error = e as Error | AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(axiosError.response.data);
          console.log(axiosError.response.status)
          console.log(axiosError.response.headers)
        } else if (axiosError.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(axiosError.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', axiosError.message)
        }
        // Access to config, request, and response
      } else {
        // Just a stock error
        console.error('non-AxiosError')
      }

      throw error
    }
  }

  private logData(
    request: BookingPalRequest,
    requestId: string,
    dataType: 'RESPONSE' | 'REQUEST',
    data: unknown
  ) {
    console.log(
      JSON.stringify({
        bookingPalRequestId: requestId,
        method: request.method,
        endpoint: request.endpoint,
        caller: request.caller,
        dataType: dataType,
        data,
      })
    )
  }
}

export default WizardClient
