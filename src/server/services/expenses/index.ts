import type { PrismaClient } from '@prisma/client'
import type {
  ExpenseCreate,
  IExpense,
  IListingExpense,
  ListingExpenseCreate,
  MonthFilter,
} from 'types/expenses'
import { getMonthStartAndEnd } from 'utils/dates'
import type PlaidService from '../plaid'

class ExpenseService {
  constructor(
    private readonly prismaExpense: PrismaClient['expense'],
    private readonly prismaListingExpense: PrismaClient['listingExpense'],
    private readonly plaidService: PlaidService,
    private readonly organizationId: string
  ) {}

  async getPage(listingId: string, month: MonthFilter, page: number) {
    const [startOfMonth, endOfMonth] =
      month === '' ? [undefined, undefined] : getMonthStartAndEnd(month)

    const totalNumberOfExpenses = await this.getCount(
      listingId,
      startOfMonth,
      endOfMonth
    )

    const pageTooHigh = page > Math.ceil(totalNumberOfExpenses / 20)

    const expenses = await this.prismaExpense.findMany({
      where: {
        listingExpenses: {
          some: {
            listing: { organizationId: this.organizationId },
            listingId: listingId === '' ? undefined : listingId,
          },
        },
        date: {
          lte: endOfMonth,
          gte: startOfMonth,
        },
      },
      include: {
        user: true,
        listingExpenses: {
          include: {
            listing: {
              select: { name: true, propertyOwner: { select: { name: true } } },
            },
            ownerStatement: { select: { locked: true } },
          },
        },
      },
      skip: pageTooHigh ? undefined : 20 * (page - 1),
      take: 20,
      orderBy: {
        date: 'desc',
      },
    })

    const mappedExpenses = expenses.map((expense) => {
      const ownerPaid = expense.listingExpenses.reduce(
        (acc, cur) => acc + (cur?.amountPaid || 0),
        0
      )
      const ownerCharged = expense.listingExpenses.reduce(
        (acc, cur) => acc + (cur?.amount || 0),
        0
      )

      return {
        id: expense.id,
        date: expense.date,
        vendor: expense.vendor || '',
        amount: expense.amount || 0,
        description: expense.description || '',
        workOrder: expense.workOrder || '',
        receiptUrl: expense.receiptUrl || '',
        invoiceUrl: expense.invoiceUrl || '',
        listingId:
          expense.listingExpenses.length > 1
            ? 'Multiple'
            : expense.listingExpenses[0].listingId,
        listingName: expense.listingExpenses[0].listing.name,
        ownerName:
          expense.listingExpenses.length > 1
            ? 'Multiple'
            : expense.listingExpenses[0].listing.propertyOwner?.name,
        ownerPaidAmount: ownerPaid,
        ownerChargedAmount: ownerCharged,
        ownerUnpaidAmount: ownerCharged - ownerPaid,
        ownerStatementLocked: expense.listingExpenses.some(
          (le) => le.ownerStatement?.locked
        ),

        listingExpenses: expense.listingExpenses.map((le) => {
          return {
            id: le.id || '',
            listingId: le.listingId || '',
            listingName: le.listing.name || '',
            ownerName: le.listing.propertyOwner?.name || '',
            ownerPaidAmount: le.amountPaid || 0,
            ownerChargedAmount: le.amount || 0,
            ownerUnpaidAmount: le.amount || 0 - le.amountPaid || 0,
            ownerStatementId: le.ownerStatementId,
            ownerStatementLocked: le.ownerStatement?.locked,
          } as IListingExpense
        }),
      } as IExpense
    })

    return {
      expenses: mappedExpenses,
      totalNumberOfExpenses,
      pageTooHigh,
    }
  }

  async getCount(listingId: string, startOfMonth?: Date, endOfMonth?: Date) {
    const count = await this.prismaExpense.count({
      where: {
        listingExpenses: {
          some: {
            listing: { organizationId: this.organizationId },
            listingId: listingId === '' ? undefined : listingId,
          },
        },
        date: {
          lte: endOfMonth,
          gte: startOfMonth,
        },
      },
    })

    return count
  }

  async create(input: ExpenseCreate) {
    const data = {
      date: input.date,
      vendor: input.vendor,
      amount: input.amount,
      description: input.description,
      receiptUrl: input.receiptUrl,
      invoiceUrl: input.invoiceUrl,
      workOrder: input.workOrder,
      userId: input.userId,
      plaidTransactionId: input.plaidTransactionId,
    }

    const expense = await this.prismaExpense.create({
      data,
    })

    await this.prismaListingExpense.createMany({
      data: input.listingExpenses.map(
        (listingExpense: ListingExpenseCreate) => ({
          ...listingExpense,
          expenseId: expense.id,
        })
      ),
    })

    if (input.plaidTransactionId)
      await this.plaidService.updateTransaction(
        input.plaidTransactionId,
        'ACCEPTED'
      )
  }

  async getOne(id: string) {
    const expense = await this.prismaExpense.findUnique({
      where: { id },
      include: {
        user: true,
        listingExpenses: {
          include: {
            listing: {
              select: {
                id: true,
                name: true,
                propertyOwner: { select: { name: true } },
              },
            },
            ownerStatement: { select: { locked: true } },
          },
        },
      },
    })

    // HACK: Added to avoid type errors on frontend, but seems silly
    return {
      expense: {
        id: expense?.id,
        date: expense?.date as Date,
        vendor: expense?.vendor as string,
        amount: expense?.amount as number,
        description: expense?.description ?? undefined,
        workOrder: expense?.workOrder ?? undefined,
        receiptUrl: expense?.receiptUrl ?? '',
        invoiceUrl: expense?.invoiceUrl ?? '',
        userId: expense?.userId ?? undefined,
        listingExpenses: expense?.listingExpenses as ListingExpenseCreate[],
      },
      ownerStatementLocked: expense?.listingExpenses.some(
        (le) => le.ownerStatement?.locked
      ),
    }
  }

  async update(expense: ExpenseCreate) {
    await this.prismaListingExpense.deleteMany({
      where: { expenseId: expense.id },
    })

    await this.prismaExpense.update({
      where: { id: expense.id },
      data: {
        date: expense.date,
        vendor: expense.vendor,
        amount: expense.amount,
        description: expense.description,
        receiptUrl: expense.receiptUrl,
        invoiceUrl: expense.invoiceUrl,
        workOrder: expense.workOrder,
        userId: expense.userId,
      },
    })

    await this.prismaListingExpense.createMany({
      data: expense.listingExpenses.map(
        (listingExpense: ListingExpenseCreate) => ({
          confirmationCode: listingExpense.confirmationCode,
          amount: listingExpense.amount,
          amountPaid: listingExpense.amountPaid,
          listingId: listingExpense.listingId,
          expenseId: expense.id as string,
        })
      ),
    })
  }

  async delete(expenseIds: string[]) {
    // INFO: This deletes all listingExpenses associated with an expense
    // TODO: Enhance so that you can individually select listing expenses to delete
    // Take a list of listingExpenseIds as parameter instead
    // Requires UI update

    // delete listing expense(s) first
    await this.prismaListingExpense.deleteMany({
      where: { expenseId: { in: expenseIds } },
    })
    // delete expenses
    await this.prismaExpense.deleteMany({
      where: { id: { in: expenseIds } },
    })
  }
}
export default ExpenseService
