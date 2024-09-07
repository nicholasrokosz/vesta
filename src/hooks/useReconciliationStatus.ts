import type { IPlaidTransaction } from 'types/expenses'
import type { IRevenueEvent } from 'types/revenue'

interface ReconciliationStatusProps {
  transactions: IPlaidTransaction[]
  reservations: IRevenueEvent[]
}

export function useReconciliationStatus({
  transactions,
  reservations,
}: ReconciliationStatusProps) {
  const sumTransactions =
    transactions.length > 0
      ? transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
      : null

  const sumReservations =
    reservations.length > 0
      ? reservations.reduce(
          (sum, reservation) => sum + reservation.revenue.payoutAmount,
          0
        )
      : null

  const gapToReconcile =
    sumReservations !== null && sumTransactions !== null
      ? sumReservations - sumTransactions
      : null

  return {
    sumTransactions,
    sumReservations,
    gapToReconcile,
    canReconcile:
      gapToReconcile === null
        ? false
        : Math.abs(gapToReconcile).toFixed(2) === '0.00',
  }
}
