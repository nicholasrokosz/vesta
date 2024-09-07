// interface MiscUrlParams {
//   [key: string]: string
// }

export type SortDir = 'asc' | 'desc'

// interface RevenueReconciliationTransactionsUrlParams {
//   transactionsSort?: string
//   transactionsDir?: SortDir
// }

// interface RevenueReconciliationReservationsUrlParams {
//   reservationsSort?: string
//   reservationsDir?: SortDir
// }

export interface UrlParams {
  [key: string]: string
}

// export interface UrlParams
//   extends RevenueReconciliationReservationsUrlParams,
//     RevenueReconciliationTransactionsUrlParams {
//   [key: string]: string
// }

// export type UrlParams =
//   | RevenueReconciliationTransactionsUrlParams
//   | RevenueReconciliationReservationsUrlParams
//   | MiscUrlParams
