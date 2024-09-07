import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from '../RevenueTable/RevenueCell'
import RevenueRow from '../RevenueTable/RevenueRow'
import { RevenueRowType, RevenueCellFormat } from '../RevenueTable/types'
import { RevenueTable } from '..'

interface Props {
  nights: number
  rate: number
  accommodationTotal: number
  fees: { name: string; value: number }[]
  taxesTotal: number
  guestTotal: number
  discount?: number
  totalAfterDiscount?: number
}

const RevenueDisplay = ({
  nights,
  rate,
  accommodationTotal,
  fees,
  taxesTotal,
  guestTotal,
  discount,
  totalAfterDiscount,
}: Props) => {
  return (
    <>
      <RevenueTable hideShare={true}>
        <RevenueRow type={RevenueRowType.Item}>
          <RevenueCell>
            <Text>
              {`${nights} nights x ${formatCurrency(rate)} avg. per night`}
            </Text>
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            <Text>{formatCurrency(accommodationTotal)}</Text>
          </RevenueCell>
        </RevenueRow>

        {fees.map((fee, index) => (
          <RevenueRow type={RevenueRowType.Item} key={index}>
            <RevenueCell>
              <Text>{fee.name}</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>{formatCurrency(fee.value)}</Text>
            </RevenueCell>
          </RevenueRow>
        ))}

        <RevenueRow type={RevenueRowType.Item}>
          <RevenueCell>
            <Text>Taxes</Text>
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            <Text>{formatCurrency(taxesTotal)}</Text>
          </RevenueCell>
        </RevenueRow>
        <RevenueRow type={RevenueRowType.Summary}>
          <RevenueCell>
            <Text>Total cost to guest</Text>
          </RevenueCell>
          <RevenueCell format={RevenueCellFormat.Currency}>
            <Text>{formatCurrency(guestTotal)}</Text>
          </RevenueCell>
        </RevenueRow>

        {!!discount && totalAfterDiscount && (
          <>
            <RevenueRow type={RevenueRowType.Item}>
              <RevenueCell>
                <Text>Discount</Text>
              </RevenueCell>
              <RevenueCell format={RevenueCellFormat.Currency}>
                <Text>{formatCurrency(discount)}</Text>
              </RevenueCell>
            </RevenueRow>
            <RevenueRow type={RevenueRowType.Summary}>
              <RevenueCell>
                <Text>Total cost to guest after discount</Text>
              </RevenueCell>
              <RevenueCell format={RevenueCellFormat.Currency}>
                <Text>{formatCurrency(totalAfterDiscount)}</Text>
              </RevenueCell>
            </RevenueRow>
          </>
        )}
      </RevenueTable>
    </>
  )
}

export default RevenueDisplay
