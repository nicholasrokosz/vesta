import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat } from './types'
import type { IRevenueTax } from 'types/revenue'
import AmountWithShare from './AmountWithShare'

interface Props {
  tax: IRevenueTax
}

const TaxRow = ({ tax }: Props) => {
  return (
    <RevenueRow>
      <RevenueCell>Plus: {tax.description}</RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <Text>{formatCurrency(tax.value.amount)}</Text>
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={tax.value.managerAmount}
          share={tax.value.managerShare}
          isDeduction={true}
        />
      </RevenueCell>
      <RevenueCell format={RevenueCellFormat.Currency}>
        <AmountWithShare
          amount={tax.value.ownerAmount}
          share={tax.value.ownerShare}
          isDeduction={true}
        />
      </RevenueCell>
    </RevenueRow>
  )
}

export default TaxRow
