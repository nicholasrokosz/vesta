import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import AmountWithShare from './AmountWithShare'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat } from './types'
import type { ShareSplit } from 'types/revenue'

interface Props {
  text: string
  total: ShareSplit
}

const LineItemRow = ({ text, total }: Props) => {
  return (
    <RevenueRow>
      <RevenueCell>
        <Text>{text}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <Text>{formatCurrency(total.amount)}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={total.managerAmount}
          share={total.managerShare}
        />
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare amount={total.ownerAmount} share={total.ownerShare} />
      </RevenueCell>
    </RevenueRow>
  )
}

export default LineItemRow
