import type { PlaidImportStatus } from '@prisma/client'
import { z } from 'zod'

export const ListingExpenseSchema = z
  .object({
    id: z.string().optional(),
    expenseId: z.string().optional(),
    amount: z.number(),
    amountPaid: z.number().optional().default(0),
    listingId: z.string(),
    confirmationCode: z.string().optional(),
  })
  .strict()
export type ListingExpenseCreate = z.infer<typeof ListingExpenseSchema>

export const ExpenseCreateSchema = z
  .object({
    id: z.string().optional(),
    date: z.date(),
    vendor: z.string().min(1, { message: 'Required' }),
    amount: z.number(),
    description: z.string().optional(),
    receiptUrl: z.string().optional(),
    invoiceUrl: z.string().optional(),
    workOrder: z.string().optional(),
    userId: z.string().optional(),
    listingExpenses: z.array(ListingExpenseSchema),
    plaidTransactionId: z.string().optional(),
  })
  .strict()
export type ExpenseCreate = z.infer<typeof ExpenseCreateSchema>

export const ExpenseUpdateSchema = z
  .object({
    id: z.string(),
    date: z.date(),
    vendor: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    receiptUrl: z.string().optional(),
    invoiceUrl: z.string().optional(),
    workOrder: z.string().optional(),
    userId: z.string().optional(),
    listingExpenses: z.array(ListingExpenseSchema),
  })
  .strict()
export type ExpenseUpdate = z.infer<typeof ExpenseUpdateSchema>

export interface IListingExpense {
  id: string
  listingId: string
  listingName: string
  ownerName: string
  ownerPaidAmount: number // amount paid by owner
  ownerChargedAmount: number // amount charged to owner (all or part of amount)
  ownerUnpaidAmount: number // amount unpaid by owner
  ownerStatementId?: string
}

export interface IExpense {
  id: string
  date: Date
  vendor: string
  amount: number // invoice amount
  description: string
  listingId: string
  listingName: string
  ownerName: string
  ownerPaidAmount: number // rollup amount paid by owner(s)
  ownerChargedAmount: number // rollup amount charged to owner(s) (all or part of amount)
  ownerUnpaidAmount: number // rollup amount unpaid by owner(s)
  ownerStatementLocked?: boolean
  receiptUrl?: string
  invoiceUrl?: string
  listingExpenses: IListingExpense[]
}

export interface IPlaidTransaction {
  id: string
  accountId: string
  status: PlaidImportStatus
  date: Date
  amount: number
  vendor: string
  account: { name: string }
}

export type MonthFilter = 'last' | 'current' | 'next' | ''

export type ExpensesUrlParams = 'listing' | 'month' | 'page'
