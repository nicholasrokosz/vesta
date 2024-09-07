import type { AxiosError } from 'axios'
import HttpClient from 'utils/http-client'
import { v4 as uuidv4 } from 'uuid'

export type Token = string

interface GetLoginTokenResponse {
  message: string
  is_error: boolean
  code: string
  token: string
  partyId: number
  organizationId: number
  name: string
  supplierId: number
}

export interface BookingPalResponse<T> {
  message: string
  is_error: boolean
  errorMessage: string[]
  code: string
  data: T[]
}

export type BookingPalRequest = {
  caller: string
  endpoint: string
} & (
  | {
      method: 'GET'
      query?: [key: string, value: string][]
    }
  | {
      method: 'POST' | 'PUT'
      data: unknown
    }
)

class BookingPalHttpClient<T extends Token> extends HttpClient {
  protected constructor() {
    super(process.env.BOOKING_PAL_BASE_URI ?? '')
    const apiKey = process.env.BOOKING_PAL_API_KEY ?? ''

    this.instance.defaults.headers.common['x-api-key'] = apiKey
  }

  protected async getLoginToken(
    username: string,
    password: string
  ): Promise<T> {
    try {
      const response = await this.instance.get<GetLoginTokenResponse>(
        '/authc/login',
        {
          params: { username: username, password: password },
        }
      )

      return response.token as T
    } catch (e) {
      const error = e as Error | AxiosError
      // if (axios.isAxiosError(error)) {
      //   const axiosError = error as AxiosError

      //   if (axiosError.response) {
      //     // The request was made and the server responded with a status code
      //     // that falls out of the range of 2xx
      //     // console.log(axiosError.response.data);
      //     console.log(axiosError.response.status)
      //     console.log(axiosError.response.headers)
      //   } else if (axiosError.request) {
      //     // The request was made but no response was received
      //     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      //     // http.ClientRequest in node.js
      //     console.log(axiosError.request)
      //   } else {
      //     // Something happened in setting up the request that triggered an Error
      //     console.log('Error', axiosError.message)
      //   }
      //   // Access to config, request, and response
      // } else {
      //   // Just a stock error
      //   console.error('non-AxiosError')
      // }

      throw error
    }
  }

  protected async sendRequest<R>(token: T, request: BookingPalRequest) {
    const requestId = uuidv4()
    try {
      let response = null
      switch (request.method) {
        case 'GET':
          this.logData(request, requestId, 'REQUEST', null)
          response = await this.get<R>(request.endpoint, token, request.query)
          break
        case 'POST':
          this.logData(request, requestId, 'REQUEST', request.data)
          response = await this.post<R>(request.endpoint, token, request.data)
          break
        case 'PUT':
          this.logData(request, requestId, 'REQUEST', request.data)
          response = await this.put<R>(request.endpoint, token, request.data)
          break
      }

      this.logData(request, requestId, 'RESPONSE', response)

      if (response.is_error) {
        throw new Error(response.errorMessage.join(', '))
      }

      return response.data
    } catch (e) {
      const error = e as Error | AxiosError

      console.error(
        `BookingPal error calling ${request.method} ${request.endpoint} (${requestId}): ${error.message}`
      )

      throw error
    }
  }

  private async get<R>(
    path: string,
    token: T,
    query?: [key: string, value: string][]
  ) {
    const params = this.getParams(token, query)

    return await this.instance.get<BookingPalResponse<R>>(path, {
      params,
    })
  }

  private async post<R>(path: string, token: T, data: unknown) {
    return await this.instance.post<BookingPalResponse<R>>(
      path,
      {
        data: data,
      },
      {
        params: { jwt: token },
      }
    )
  }

  private async put<R>(path: string, token: T, data: unknown) {
    return await this.instance.put<BookingPalResponse<R>>(
      path,
      {
        data: data,
      },
      {
        params: { jwt: token },
      }
    )
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

  private getParams(token: T, query?: [key: string, value: string][]) {
    if (!query) {
      return { jwt: token }
    } else {
      const params = query.reduce<{ [key: string]: string }>(
        (obj, [key, value]) => {
          obj[key] = value
          return obj
        },
        {}
      )

      return {
        ...params,
        jwt: token,
      }
    }
  }
}

export default BookingPalHttpClient
