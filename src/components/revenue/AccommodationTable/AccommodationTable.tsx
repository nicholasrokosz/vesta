import { Text, Title } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

import { formatCurrency } from 'utils/formatCurrency'
import {
  RevenueTable,
  SummaryRow,
  LineItemRow,
  RevenueRow,
  RevenueCell,
  AmountWithShare,
} from 'components/revenue'
import { RevenueCellFormat } from '../RevenueTable/types'
import TaxRollupRow from '../RevenueTable/TaxRollupRow'
import type { AccommodationRevenueSummary } from 'server/services/revenue/accommodationRevenue'

interface Props {
  accommodationRevenue: AccommodationRevenueSummary
  reservation: {
    nights: string
  }
}

const AccommodationTable = ({ accommodationRevenue, reservation }: Props) => {
  const {
    roomRateTotal,
    discount,
    taxableRevenue,
    grossRevenue,
    netRevenue,
    taxes,
  } = accommodationRevenue

  const channelCommission = accommodationRevenue.channelCommission
  const creditCard = accommodationRevenue.creditCard

  return (
    <>
      <Title order={1}>Accommodation revenue</Title>
      <RevenueTable>
        <LineItemRow
          text={`${reservation.nights} x ${formatCurrency(
            accommodationRevenue.roomRate
          )} avg. per night`}
          total={roomRateTotal}
        />
        {discount.amount > 0 && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Discount</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(discount.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={discount.managerAmount}
                share={discount.managerShare}
                isDeduction={true}
              />
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={discount.ownerAmount}
                share={discount.ownerShare}
                isDeduction={true}
              />
            </RevenueCell>
          </RevenueRow>
        )}
        <SummaryRow
          text="Taxable accommodation revenue"
          shareSplit={taxableRevenue}
        />
        <TaxRollupRow
          taxes={accommodationRevenue.taxes}
          plusOrLess="plus"
          showPercentages
        />
        <SummaryRow
          text="Gross accommodation revenue"
          shareSplit={grossRevenue}
        />
        {!!channelCommission && channelCommission.amount > 0 && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Channel commission</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(channelCommission.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={channelCommission.managerAmount}
                share={channelCommission.managerShare}
                isDeduction={true}
              />
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={channelCommission.ownerAmount}
                share={channelCommission.ownerShare}
                isDeduction={true}
              />
            </RevenueCell>
          </RevenueRow>
        )}
        {!!creditCard && creditCard.amount > 0 && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Credit card fees</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(creditCard.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={creditCard.managerAmount}
                share={creditCard.managerShare}
                isDeduction={true}
              />
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={creditCard.ownerAmount}
                share={creditCard.ownerShare}
                isDeduction={true}
              />
            </RevenueCell>
          </RevenueRow>
        )}
        <TaxRollupRow taxes={taxes} plusOrLess="less" showPercentages />
        <SummaryRow text="Net accommodation revenue" shareSplit={netRevenue} />
      </RevenueTable>
    </>
  )
}

export default AccommodationTable
