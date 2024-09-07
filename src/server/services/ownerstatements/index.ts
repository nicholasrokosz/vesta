/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ReservationStatus, type PrismaClient } from '@prisma/client'
import { DateTime } from 'luxon'
import { RevenueSummaryBuilder } from 'server/services/revenue/revenueSummary'
import { getNights } from '../calendar/dates'
import type UserService from '../user/user'
import ListingService from '../listing'
import { OwnerStatement } from './ownerStatement'

class OwnerStatementService {
  private readonly listingService: ListingService

  constructor(
    private readonly prismaCalendarEvents: PrismaClient['calendarEvent'],
    private readonly prismaExpense: PrismaClient['expense'],
    private readonly prismaListingExpense: PrismaClient['listingExpense'],
    private readonly prismaOwnerStatement: PrismaClient['ownerStatement'],
    private readonly prismaRevenue: PrismaClient['revenue'],
    private readonly organizationId: string,
    private readonly userService: UserService
  ) {
    this.listingService = new ListingService()
  }

  async getAllForOrg() {
    const owners = await this.userService.getPropertyOwners(this.organizationId)

    return await Promise.all(
      owners.map(async (owner) =>
        this.getStatementsByOwner(owner.id, owner.name)
      )
    )
  }

  async getAllForOwner(userId: string, userName: string | null) {
    return [await this.getStatementsByOwner(userId, userName)]
  }

  private async getStatementsByOwner(userId: string, userName: string | null) {
    const listings = await this.listingService.getAllByOwner(userId)

    return {
      name: userName,
      listings: await Promise.all(
        listings.map(async (listing) => {
          const statements = await this.prismaOwnerStatement.findMany({
            where: {
              listingId: listing.id,
            },
          })

          const sorted = statements.sort((a, b) => {
            const aDate = DateTime.fromObject({
              month: a.month,
              year: a.year,
            })
            const bDate = DateTime.fromObject({
              month: b.month,
              year: b.year,
            })

            return aDate < bDate ? -1 : 1
          })

          let nextStatementDate: DateTime
          if (sorted.length > 0) {
            nextStatementDate = DateTime.fromObject({
              month: sorted[sorted.length - 1].month,
              year: sorted[sorted.length - 1].year,
            }).plus({ month: 1 })
          } else {
            nextStatementDate = DateTime.fromJSDate(new Date()).minus({
              month: 1,
            })
          }

          for (let i = 0; i < 2; i++) {
            nextStatementDate = nextStatementDate.plus({ month: i })
            statements.push({
              id: '',
              listingId: listing.id,
              month: nextStatementDate.get('month'),
              year: nextStatementDate.get('year'),
              locked: false,
              isCoHost: false,
            })
          }

          return {
            id: listing.id,
            name: listing.name,
            statements: statements
              .sort((a, b) => {
                const aDate = DateTime.fromObject({
                  month: a.month,
                  year: a.year,
                })
                const bDate = DateTime.fromObject({
                  month: b.month,
                  year: b.year,
                })

                return aDate > bDate ? -1 : 1
              })
              .map((statement) => {
                return {
                  id: statement.id,
                  listingId: listing.id,
                  listingName: listing.name,
                  month: statement.month,
                  year: statement.year,
                  isLocked: statement.locked,
                }
              }),
          }
        })
      ),
    }
  }

  async getLocked(id: string) {
    const statement = await this.prismaOwnerStatement.findUniqueOrThrow({
      where: {
        id: id,
      },
      include: {
        listing: { select: { propertyOwner: true, name: true } },
        listingExpenses: {
          select: { amount: true, amountPaid: true, expense: true },
        },
        revenue: {
          include: {
            reservation: {
              select: {
                id: true,
                status: true,
                confirmationCode: true,
                channel: true,
                adults: true,
                children: true,
                calendarEvent: {
                  select: { fromDate: true, toDate: true },
                },
              },
            },
            fees: { include: { deductions: true } },
          },
        },
      },
    })

    const isCoHost = statement.isCoHost

    const startDate = DateTime.fromObject({
      month: statement.month,
      year: statement.year,
    })

    const ownerExpenses = statement.listingExpenses.map((listingExpense) => {
      const ownerPaid = listingExpense.amountPaid || 0
      const ownerCharged = listingExpense.amount || 0

      return {
        id: listingExpense.expense.id,
        amount: listingExpense.amount,
        date: listingExpense.expense?.date,
        vendor: listingExpense.expense?.vendor || '',
        description: listingExpense.expense?.description || '',
        workOrder: listingExpense.expense?.workOrder || '',
        receiptUrl: listingExpense.expense?.receiptUrl || '',
        invoiceUrl: listingExpense.expense?.invoiceUrl || '',
        listingId: statement.listingId || '',
        listingName: statement.listing?.name || '',
        ownerName: statement.listing?.propertyOwner?.name || '',
        ownerPaidAmount: ownerPaid,
        ownerChargedAmount: ownerCharged,
        ownerUnpaidAmount: ownerCharged - ownerPaid,
        listingExpenses: [],
      }
    })

    const reservations = statement.revenue.map((revenue) => {
      const numberOfNights = getNights(
        revenue.reservation.calendarEvent.fromDate,
        revenue.reservation.calendarEvent.toDate
      )
      const summary = new RevenueSummaryBuilder(revenue, numberOfNights)
        .build()
        .getSummary()

      return {
        numberOfNights: numberOfNights,
        id: revenue.reservation.id,
        confirmationCode: revenue.reservation?.confirmationCode ?? '',
        channel: revenue.reservation?.channel ?? '',
        numGuests:
          (revenue.reservation?.adults ?? 0) +
          (revenue?.reservation?.children ?? 0),
        checkIn: revenue.reservation?.calendarEvent.fromDate,
        checkOut: revenue.reservation?.calendarEvent.toDate,
        revenue: summary,
      }
    })

    const ownerStatement = new OwnerStatement({
      listingId: statement.listingId,
      listingName: statement.listing?.name || '',
      expenses: ownerExpenses ?? [],
      reservations: reservations ?? [],
      isCoHost,
      startDate,
    }).build()

    return {
      statement: ownerStatement,
    }
  }

  async lockStatement(listingId: string, month: number, year: number) {
    const isCohost = await this.listingService.isCohost(listingId)
    const statement = await this.prismaOwnerStatement.create({
      data: { listingId, month, year, locked: true, isCoHost: isCohost },
    })

    const startDate = DateTime.fromObject({ year, month })
    const endDate = startDate.plus({ month: 1 })

    await this.prismaRevenue.updateMany({
      data: { ownerStatementId: statement.id },
      where: {
        reservation: {
          calendarEvent: {
            listingId: listingId,
            toDate: {
              gte: startDate.toJSDate(),
              lt: endDate.toJSDate(),
            },
          },
        },
      },
    })

    await this.prismaListingExpense.updateMany({
      data: { ownerStatementId: statement.id },
      where: {
        listingId: listingId,
        expense: {
          date: {
            lte: endDate.toJSDate(),
          },
        },
        ownerStatement: { is: null },
      },
    })
  }

  async getDraft(listingId: string, month: number, year: number) {
    const lockedStatement = await this.prismaOwnerStatement.findFirst({
      where: {
        listingId: listingId,
        month: month,
        year: year,
      },
    })

    // If there is already a locked statement, return its id
    if (lockedStatement) {
      return {
        id: lockedStatement.id,
        statement: null,
      }
    }

    const listing = await this.listingService.getOne(listingId)

    const startDate = DateTime.fromObject({ year, month })
    const endDate = startDate.plus({ month: 1 })
    const isCoHost = await this.listingService.isCohost(listingId)

    const unlockedExpenses = await this.prismaExpense.findMany({
      where: {
        date: {
          lte: endDate.toJSDate(),
        },
        listingExpenses: {
          some: {
            listingId: listingId,
            ownerStatement: { is: null },
          },
        },
      },
      include: {
        user: true,
        listingExpenses: {
          include: {
            listing: {
              select: {
                propertyOwner: { select: { name: true } },
              },
            },
          },
        },
      },
    })

    const ownerExpenses = unlockedExpenses.map((expense) => {
      const listingExpense = expense.listingExpenses.find((le) => {
        return le.listingId === listingId
      })
      const ownerPaid = listingExpense?.amountPaid || 0
      const ownerCharged = listingExpense?.amount || 0

      return {
        id: expense.id,
        amount: expense.amount,
        date: expense.date,
        vendor: expense.vendor || '',
        description: expense.description || '',
        workOrder: expense.workOrder || '',
        receiptUrl: expense.receiptUrl || '',
        invoiceUrl: expense.invoiceUrl || '',
        listingId: listing?.id || '',
        listingName: listing?.name || '',
        ownerName: listing?.propertyOwner?.name || '',
        ownerPaidAmount: ownerPaid,
        ownerChargedAmount: ownerCharged,
        ownerUnpaidAmount: ownerCharged - ownerPaid,
        listingExpenses: [],
      }
    })

    const listingEvents = await this.prismaCalendarEvents.findMany({
      where: {
        listingId: listingId,
        reservation: {
          isNot: { status: ReservationStatus.CANCELLED },
        },
        toDate: {
          gte: startDate.toJSDate(),
          lt: endDate.toJSDate(),
        },
      },
      include: {
        listing: {
          select: {
            name: true,
          },
        },
        reservation: {
          select: {
            id: true,
            status: true,
            confirmationCode: true,
            channel: true,
            adults: true,
            children: true,
            revenue: {
              include: {
                fees: { include: { deductions: true } },
                reservation: { select: { channel: true } },
              },
            },
          },
        },
      },
    })

    const reservations = listingEvents
      .sort((a, b) => (a.toDate < b.toDate ? -1 : 1))
      .map((event) => {
        if (event.reservation && event.reservation.revenue) {
          const revenue = event.reservation.revenue
          const numberOfNights = getNights(event.fromDate, event.toDate)

          const summary = new RevenueSummaryBuilder(revenue, numberOfNights)
            .build()
            .getSummary()

          return {
            numberOfNights: numberOfNights,
            id: event.reservation.id,
            confirmationCode: event.reservation?.confirmationCode ?? '',
            channel: event.reservation?.channel ?? '',
            numGuests:
              event.reservation?.adults ??
              0 + (event?.reservation?.children || 0),
            checkIn: event.fromDate,
            checkOut: event.toDate,
            revenue: summary,
          }
        }
      })

    const ownerStatement = new OwnerStatement({
      listingId,
      listingName: listing?.name ?? '',
      expenses: ownerExpenses ?? [],
      reservations: reservations ?? [],
      isCoHost,
      startDate,
    }).build()

    return {
      statement: ownerStatement,
    }
  }
}

export default OwnerStatementService
