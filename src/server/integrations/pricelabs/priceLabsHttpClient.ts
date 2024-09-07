import type { AxiosError } from 'axios'
import HttpClient from 'utils/http-client'
import { v4 as uuidv4 } from 'uuid'

export interface PriceLabsResponse {
  error: string
  message: string
  is_error: boolean
  errorMessage: string[]
  code: string
}

export type PriceLabsRequest = {
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

class PriceLabsHttpClient extends HttpClient {
  protected constructor() {
    super(process.env.PRICELABS_API_BASE_URL ?? '')
    const apiName = process.env.PRICELABS_API_NAME ?? ''
    const apiToken = process.env.PRICELABS_API_TOKEN ?? ''

    this.instance.defaults.headers.common['X-INTEGRATION-NAME'] = apiName
    this.instance.defaults.headers.common['X-INTEGRATION-TOKEN'] = apiToken
  }

  protected updateToken(token: string) {
    this.instance.defaults.headers.common['X-INTEGRATION-TOKEN'] = token
  }

  protected async sendRequest<R>(request: PriceLabsRequest) {
    const requestId = uuidv4()
    try {
      let response = null
      switch (request.method) {
        case 'GET':
          this.logData(request, requestId, 'REQUEST', null)
          response = await this.get<R>(request.endpoint, request.query)
          break
        case 'POST':
          this.logData(request, requestId, 'REQUEST', request.data)
          response = await this.post<R>(request.endpoint, request.data)
          break
        case 'PUT':
          this.logData(request, requestId, 'REQUEST', request.data)
          response = await this.put<R>(request.endpoint, request.data)
          break
      }

      // this.logData(request, requestId, 'RESPONSE', response)

      return response
    } catch (e) {
      const error = e as Error | AxiosError
      console.error(
        `PriceLabs error calling ${request.method} ${request.endpoint} (${requestId}): ${error.message}`
      )

      throw error
    }
  }

  private async get<R>(path: string, query?: [key: string, value: string][]) {
    const params = this.getParams(query)

    return await this.instance.get<R>(path, {
      params,
    })
  }

  private async post<R>(path: string, data: unknown) {
    return await this.instance.post<R>(path, data)
  }

  private async put<R>(path: string, data: unknown) {
    return await this.instance.put<R>(path, data)
  }

  private logData(
    request: PriceLabsRequest,
    requestId: string,
    dataType: 'RESPONSE' | 'REQUEST',
    data: unknown
  ) {
    console.debug(
      JSON.stringify({
        priceLabsRequestId: requestId,
        method: request.method,
        endpoint: request.endpoint,
        caller: request.caller,
        dataType: dataType,
        data,
      })
    )
  }

  private getParams(query?: [key: string, value: string][]) {
    if (!query) {
      return null
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
      }
    }
  }
}

export default PriceLabsHttpClient
