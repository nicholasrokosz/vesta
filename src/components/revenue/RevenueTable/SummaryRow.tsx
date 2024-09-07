import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat, RevenueRowType } from './types'
import AmountWithShare from './AmountWithShare'
import type { ShareSplit } from 'types/revenue'

interface Props {
  text: string
  shareSplit: ShareSplit
}

const SummaryRow = ({ text, shareSplit }: Props) => {
  return (
    <RevenueRow type={RevenueRowType.Summary}>
      <RevenueCell>
        <Text>{text}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <Text>{formatCurrency(shareSplit.amount)}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={shareSplit.managerAmount}
          share={shareSplit.managerShare}
          isSummary
        />
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={shareSplit.ownerAmount}
          share={shareSplit.ownerShare}
          isSummary
        />
      </RevenueCell>
    </RevenueRow>
  )
}

export default SummaryRow
