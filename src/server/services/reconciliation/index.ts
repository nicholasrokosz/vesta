import type {
  Channel,
  PlaidTransaction,
  RevenuePayoutStatus,
} from '@prisma/client'
import { type PrismaClient } from '@prisma/client'
import type RevenueService from '../revenue'

class ReconciliationService {
  constructor(
    private readonly prismaPayout: PrismaClient['payout'],
    private readonly prismaRevenuePayout: PrismaClient['revenuePayout'],
    private readonly prismaPlaidTransaction: PrismaClient['plaidTransaction'],
    private readonly prismaRevenue: PrismaClient['revenue'],
    private readonly organizationId: string,
    private readonly revenueService: RevenueService
  ) {}

  async reconcileTransaction(plaidTransactionId: string) {
    const transaction = await this.prismaPlaidTransaction.findUniqueOrThrow({
      where: { id: plaidTransactionId },
      include: { account: true },
    })

    if (
      this.isBankTransaction(transaction.account.subtype) &&
      transaction.vendor === 'Airbnb' &&
      transaction.amount > 0
    ) {
      // TODO: Reconcile!
      // await this.reconcile({
      //   plaidTransaction,
      //   reservationIds : [],
      //   channel: 'Airbnb',
      // })
    }
  }

  public async reconcileReservations({
    plaidTransactionId,
    reservationIds,
    userId,
  }: {
    plaidTransactionId: string
    reservationIds: string[]
    userId: string
  }) {
    const plaidTransaction =
      await this.prismaPlaidTransaction.findUniqueOrThrow({
        where: { id: plaidTransactionId },
      })

    await this.reconcileReservationsToTransaction({
      plaidTransaction,
      reservationIds,
      userId,
    })
  }

  public async reconcileTransactions({
    plaidTransactionIds,
    reservationId,
    userId,
  }: {
    plaidTransactionIds: string[]
    reservationId: string
    userId: string
  }) {
    await this.reconcileTransactionsToReservation({
      plaidTransactionIds,
      reservationId,
      channel: 'Airbnb',
      userId,
    })
  }

  private async reconcileTransactionsToReservation({
    plaidTransactionIds,
    reservationId,
    userId,
  }: {
    plaidTransactionIds: string[]
    reservationId: string
    channel: Channel
    userId?: string
  }) {
    const revenue = await this.revenueService.getReservationRevenue(
      reservationId
    )
    if (!revenue) return Promise.resolve()

    await Promise.all(
      plaidTransactionIds.map(async (plaidTransactionId) => {
        const plaidTransaction =
          await this.prismaPlaidTransaction.findUniqueOrThrow({
            where: { id: plaidTransactionId },
          })

        const payout = await this.prismaPayout.create({
          data: {
            date: plaidTransaction.date,
            amount: plaidTransaction.amount,
            plaidTransactionId: plaidTransaction.id,
            allocated: true,
          },
        })

        await this.connectRevenuePayout({
          revenueId: revenue.revenue.revenueId,
          payoutId: payout.id,
          payoutAmount: revenue.revenue.payoutAmount,
          userId,
        })

        await this.updatePayoutStatus(revenue.revenue.revenueId, 'FULL')
        await this.acceptTransaction(plaidTransaction.id)
      })
    )
  }

  private async reconcileReservationsToTransaction({
    plaidTransaction,
    reservationIds,
    userId,
  }: {
    plaidTransaction: PlaidTransaction
    reservationIds: string[]
    userId?: string
  }) {
    const payout = await this.prismaPayout.create({
      data: {
        date: plaidTransaction.date,
        amount: plaidTransaction.amount,
        plaidTransactionId: plaidTransaction.id,
        allocated: true,
      },
    })

    await Promise.all(
      reservationIds.map(async (reservationId) => {
        const revenue = await this.revenueService.getReservationRevenue(
          reservationId
        )
        if (!revenue) return Promise.resolve()

        await this.connectRevenuePayout({
          revenueId: revenue.revenue.revenueId,
          payoutId: payout.id,
          payoutAmount: revenue.revenue.payoutAmount,
          userId,
        })

        await this.updatePayoutStatus(revenue.revenue.revenueId, 'FULL')
        await this.acceptTransaction(plaidTransaction.id)
      })
    )
  }

  private async connectRevenuePayout({
    revenueId,
    payoutId,
    payoutAmount,
    userId,
  }: {
    revenueId: string
    payoutId: string
    payoutAmount: number
    userId?: string
  }) {
    await this.prismaRevenuePayout.create({
      data: {
        revenueId: revenueId,
        payoutId: payoutId,
        amount: payoutAmount,
        createdById: userId,
      },
    })
  }

  private async updatePayoutStatus(
    revenueId: string,
    status: RevenuePayoutStatus
  ) {
    await this.prismaRevenue.update({
      where: { id: revenueId },
      data: {
        payoutStatus: status,
      },
    })
  }

  private async acceptTransaction(plaidTransactionId: string) {
    await this.prismaPlaidTransaction.update({
      where: { id: plaidTransactionId },
      data: {
        status: 'ACCEPTED',
      },
    })
  }

  private isBankTransaction = (subtype: string) => {
    return ['checking', 'savings'].includes(subtype)
  }
}

export default ReconciliationService
