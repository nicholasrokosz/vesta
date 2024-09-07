import { Text, Title } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

import type { IReservationRevenue } from 'types/revenue'
import { formatCurrency } from 'utils/formatCurrency'
import { RevenueTable, RevenueCell, RevenueRow } from 'components/revenue'
import { RevenueCellFormat, RevenueRowType } from '../RevenueTable/types'
import TaxRollupRow from '../RevenueTable/TaxRollupRow'
import GrossBookingValueRollupRow from '../RevenueTable/GrossBookingValueRollupRow'

interface Props {
  revenue: IReservationRevenue
}

const SummaryTable = ({ revenue }: Props) => {
  return (
    <>
      <Title order={1}>Summary</Title>
      <RevenueTable>
        <GrossBookingValueRollupRow revenue={revenue} />
        {!!revenue.channelCommission && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Channel commission</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(revenue.channelCommission.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              ({formatCurrency(revenue.channelCommission.managerAmount)})
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              ({formatCurrency(revenue.channelCommission.ownerAmount)})
            </RevenueCell>
          </RevenueRow>
        )}
        {!!revenue.creditCard && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Credit card fees</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(revenue.creditCard.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              ({formatCurrency(revenue.creditCard.managerAmount)})
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              ({formatCurrency(revenue.creditCard.ownerAmount)})
            </RevenueCell>
          </RevenueRow>
        )}
        <TaxRollupRow taxes={revenue.allTaxes} plusOrLess="less" />
        <RevenueRow type={RevenueRowType.Total}>
          <RevenueCell>
            <Text>Proceeds</Text>
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            <Text>{formatCurrency(revenue.netRevenue.amount)}</Text>
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            {formatCurrency(revenue.netRevenue.managerAmount)}
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            {formatCurrency(revenue.netRevenue.ownerAmount)}
          </RevenueCell>
        </RevenueRow>
      </RevenueTable>
    </>
  )
}

export default SummaryTable
