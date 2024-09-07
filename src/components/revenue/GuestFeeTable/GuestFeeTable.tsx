import { Stack, Text, Title } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'

import {
  RevenueTable,
  FeeRow,
  SummaryRow,
  RevenueRow,
  RevenueCell,
  AmountWithShare,
} from 'components/revenue'

import { RevenueCellFormat } from '../RevenueTable/types'
import { formatCurrency } from 'utils/formatCurrency'
import TaxRollupRow from '../RevenueTable/TaxRollupRow'
import type { GuestFeesSummary } from 'server/services/revenue/guestFeeRevenue'

interface Props {
  guestFeeRevenue: GuestFeesSummary
}

const GuestFeeTable = ({ guestFeeRevenue }: Props) => {
  const taxableFees = guestFeeRevenue.guestFees?.filter((item) => item.taxable)
  const nonTaxableFees = guestFeeRevenue.guestFees?.filter(
    (item) => !item.taxable
  )

  const {
    taxableGuestFeesTotal,
    nonTaxableGuestFeesTotal,
    guestFeesGross,
    guestFeesNet,
    guestFeesChannelCommission,
    guestFeesCreditCard,
    taxes,
  } = guestFeeRevenue

  return (
    <Stack>
      <Title order={1}>Guest Fees</Title>
      <RevenueTable>
        {nonTaxableFees.map((item) => (
          <FeeRow fee={item} key={uuidv4()} />
        ))}
        {nonTaxableFees.length > 0 && (
          <SummaryRow
            text="Non-taxable guest fees"
            shareSplit={nonTaxableGuestFeesTotal}
          />
        )}

        {taxableFees.map((item) => (
          <FeeRow fee={item} key={uuidv4()} />
        ))}
        {taxableFees.length > 0 && (
          <SummaryRow
            text="Taxable guest fees"
            shareSplit={taxableGuestFeesTotal}
          />
        )}
        <TaxRollupRow
          taxes={guestFeeRevenue.taxes}
          plusOrLess="plus"
          showPercentages
        />
        <SummaryRow text="Gross guest fees" shareSplit={guestFeesGross} />

        {guestFeesChannelCommission.amount > 0 && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Channel commission</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(guestFeesChannelCommission.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={guestFeesChannelCommission.managerAmount}
                share={guestFeesChannelCommission.managerShare}
                isDeduction={true}
              />
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={guestFeesChannelCommission.ownerAmount}
                share={guestFeesChannelCommission.ownerShare}
                isDeduction={true}
              />
            </RevenueCell>
          </RevenueRow>
        )}
        {guestFeesCreditCard.amount > 0 && (
          <RevenueRow key={uuidv4()}>
            <RevenueCell>Less: Credit card fees</RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>({formatCurrency(guestFeesCreditCard.amount)})</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={guestFeesCreditCard.managerAmount}
                share={guestFeesCreditCard.managerShare}
                isDeduction={true}
              />
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <AmountWithShare
                amount={guestFeesCreditCard.ownerAmount}
                share={guestFeesCreditCard.ownerShare}
                isDeduction={true}
              />
            </RevenueCell>
          </RevenueRow>
        )}

        <TaxRollupRow taxes={taxes} plusOrLess="less" showPercentages />

        <SummaryRow text="Net guest fees" shareSplit={guestFeesNet} />
      </RevenueTable>
    </Stack>
  )
}

export default GuestFeeTable
