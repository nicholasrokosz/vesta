import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import AmountWithShare from './AmountWithShare'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat } from './types'
import type { GuestFee } from 'server/services/revenue/guestFeeRevenue'

interface Props {
  fee: GuestFee
}

const FeeRow = ({ fee }: Props) => {
  return (
    <RevenueRow>
      <RevenueCell>
        {!fee.taxable ? 'Plus: ' : ''}
        {fee.name}
        {fee.taxable ? ' (taxable)' : ' (non-taxable)'}
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <Text>{formatCurrency(fee.amount.amount)}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={fee.amount.managerAmount}
          share={fee.amount.managerShare}
        />
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={fee.amount.ownerAmount}
          share={fee.amount.ownerShare}
        />
      </RevenueCell>
    </RevenueRow>
  )
}

export default FeeRow
