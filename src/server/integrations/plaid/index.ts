import type { User } from '@prisma/client'
import type {
  LinkTokenCreateRequest,
  RemovedTransaction,
  Transaction,
} from 'plaid'
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid'

class PlaidClient {
  protected readonly client: PlaidApi

  public constructor(
    clientId: string,
    clientSecret: string,
    clientEnv: string
  ) {
    const configuration = new Configuration({
      basePath: PlaidEnvironments[clientEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': clientSecret,
        },
      },
    })

    this.client = new PlaidApi(configuration)
  }

  public async createLinkToken(user: User) {
    const request: LinkTokenCreateRequest = {
      client_name: 'Vesta Software',
      language: 'en',
      country_codes: [CountryCode.Us],
      products: [Products.Transactions],
      user: {
        client_user_id: user.id,
      },
    }

    const response = await this.client.linkTokenCreate(request)
    return response.data.link_token
  }

  public async getAccessToken(publicToken: string) {
    const exchangeTokenResponse =
      await this.getClient().itemPublicTokenExchange({
        public_token: publicToken,
      })

    return exchangeTokenResponse.data.access_token
  }

  public async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string
  ) {
    console.debug(`access token: ${accessToken}`)
    const response = await this.client.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    })

    return response.data.transactions
  }

  public async syncTransactions(accessToken: string, cursor: string | null) {
    const added: Array<Transaction> = []
    const modified: Array<Transaction> = []
    const removed: Array<RemovedTransaction> = []
    let hasMore = true

    while (hasMore) {
      const response = await this.client.transactionsSync({
        access_token: accessToken,
        cursor: cursor ?? undefined,
        options: { include_personal_finance_category: true },
      })
      const data = response.data

      added.push(...data.added)
      modified.push(...data.modified)
      removed.push(...data.removed)

      hasMore = data.has_more
      cursor = data.next_cursor
    }

    return {
      added,
      cursor,
    }
  }

  public getClient() {
    return this.client
  }
}

export default PlaidClient
