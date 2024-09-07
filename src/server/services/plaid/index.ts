import type {
  PlaidImportStatus,
  Prisma,
  PrismaClient,
  User,
} from '@prisma/client'
import PlaidClient from 'server/integrations/plaid'
import type {
  PlaidLinkOnSuccessMetadata,
  PlaidImportTransaction,
} from './types'
import { DateTime } from 'luxon'
import type { Transaction } from 'plaid'
import { quickAddJob } from 'graphile-worker'
import type { PlaidTransactionPayload } from 'server/tasks/types'

class PlaidService {
  private readonly plaidClient: PlaidClient
  constructor(
    private readonly prismaItems: PrismaClient['plaidItem'],
    private readonly prismaAccounts: PrismaClient['plaidAccount'],
    private readonly prismaTransactions: PrismaClient['plaidTransaction'],
    private readonly organizationId: string
  ) {
    this.plaidClient = new PlaidClient(
      process.env.PLAID_CLIENT_ID || '',
      process.env.PLAID_CLIENT_SECRET || '',
      process.env.PLAID_ENV || ''
    )
  }

  public async syncTransactions() {
    const items = await this.prismaItems.findMany({
      where: { organizationId: this.organizationId },
      include: { organization: { select: { startDate: true } } },
    })

    await Promise.all(
      items.map(async (item) => {
        await this.syncItem(item)
      })
    )
  }

  private async syncItem(item: {
    id: string
    accessToken: string
    cursor: string | null
    organization: {
      startDate: Date
    }
  }) {
    const data = await this.plaidClient.syncTransactions(
      item.accessToken,
      item.cursor
    )

    await this.prismaItems.update({
      where: { id: item.id },
      data: {
        cursor: data.cursor,
      },
    })

    const startOfStartMonth = DateTime.fromJSDate(item.organization.startDate)
      .startOf('month')
      .toJSDate()

    // Don't save pending or transactions before the start date
    const newTransactions = data.added.filter(
      (t) => new Date(t.date) > startOfStartMonth || t.pending
    )

    await Promise.all(
      newTransactions.map(async (transaction) => {
        try {
          await this.syncTransaction(transaction)
        } catch (e) {
          console.error(`Error adding transaction.`, transaction, e)
        }
      })
    )
  }

  private async syncTransaction(transaction: Transaction) {
    const { id } = await this.prismaTransactions.create({
      data: {
        amount: transaction.amount,
        date: new Date(transaction.date),
        vendor: transaction.merchant_name ?? transaction.name,
        name: transaction.name,
        plaidId: transaction.transaction_id,
        account: {
          connect: {
            plaidId: transaction.account_id,
          },
        },
      },
    })

    await quickAddJob({}, 'revenue-reconcile-transaction', {
      organizationId: this.organizationId,
      plaidTransactionId: id,
    } as PlaidTransactionPayload)
  }

  public async importTransaction(transaction: PlaidImportTransaction) {
    await this.prismaTransactions.create({
      data: {
        amount: transaction.amount,
        date: new Date(
          transaction.date.getYear(),
          transaction.date.getMonth() - 1,
          transaction.date.getDay()
        ),
        vendor: transaction.vendor,
        name: transaction.name,
        plaidId: transaction.plaidId,
        account: {
          connect: {
            plaidId: transaction.accountId,
          },
        },
      },
    })
  }

  public async getItems() {
    return await this.prismaItems.findMany({
      where: {
        organizationId: this.organizationId,
      },
      include: {
        accounts: true,
        creator: true,
      },
    })
  }

  public async createLinkToken(user: User) {
    return await this.plaidClient.createLinkToken(user)
  }

  public async saveLinkItem(linkItem: PlaidLinkOnSuccessMetadata, user: User) {
    const accessToken = await this.plaidClient.getAccessToken(
      linkItem.public_token
    )

    const plaidItem = await this.prismaItems.create({
      data: {
        institution: linkItem.institution.name,
        institutionId: linkItem.institution.institution_id,
        creatorId: user.id,
        organizationId: this.organizationId,
        accessToken,
      },
    })

    for (const account of linkItem.accounts) {
      await this.prismaAccounts.create({
        data: {
          itemId: plaidItem.id,
          plaidId: account.id,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype,
        },
      })
    }
  }

  public async getCount(
    accountQuery: Prisma.PlaidAccountWhereInput,
    status: PlaidImportStatus
  ) {
    const count = await this.prismaTransactions.count({
      where: {
        account: accountQuery,
        status,
      },
    })
    return count
  }

  async getAccountsBySubType(subtypes: string[]) {
    return await this.prismaAccounts.findMany({
      where: {
        subtype: { in: subtypes },
        item: { organizationId: this.organizationId },
      },
      include: { item: true },
    })
  }

  public async getBankTransactions() {
    return await this.prismaTransactions.findMany({
      where: {
        account: { subtype: { in: ['checking', 'savings'] } },
      },
      orderBy: { date: 'desc' },
      include: { account: true },
    })
  }

  public async getCreditCardTransactions(
    status: PlaidImportStatus,
    page: number,
    accountId?: string
  ) {
    const accounts = await this.getAccountsBySubType(['credit card'])

    if (accounts.length === 0)
      return { accounts, transactions: [], updatedAt: new Date() }

    let accountQuery = {}
    if (accountId) {
      accountQuery = { id: accountId }
    } else {
      accountQuery = { id: { in: accounts.map((a) => a.id) } }
    }

    const totalNumberOfTransactions = await this.getCount(accountQuery, status)
    const pageTooHigh = page > Math.ceil(totalNumberOfTransactions / 20)

    const transactions = await this.prismaTransactions.findMany({
      where: {
        account: accountQuery,
        status: status,
      },
      orderBy: { date: 'desc' },
      include: { account: true },
      skip: pageTooHigh ? undefined : 20 * (page - 1),
      take: 20,
    })

    return {
      accounts,
      totalNumberOfTransactions,
      pageTooHigh,
      transactions,
      updatedAt: accounts[0].item.updatedAt,
    }
  }

  public async getTransaction(id: string) {
    const transaction = await this.prismaTransactions.findUniqueOrThrow({
      where: { id },
    })

    return {
      id: transaction.id,
      date: transaction.date,
      amount: transaction.amount,
      vendor: transaction.vendor,
    }
  }

  public async updateTransaction(id: string, status: PlaidImportStatus) {
    await this.prismaTransactions.update({
      where: { id },
      data: { status },
    })
  }
}

export default PlaidService
