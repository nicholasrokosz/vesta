export enum RevenueCellFormat {
  Currency,
  String,
}

export enum RevenueRowType {
  Total,
  Summary,
  Item,
}

export interface IRevenueRow {
  type: RevenueRowType
}
