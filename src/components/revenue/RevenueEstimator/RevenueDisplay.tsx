import { Text } from '@mantine/core'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from '../RevenueTable/RevenueCell'
import RevenueRow from '../RevenueTable/RevenueRow'
import { RevenueRowType, RevenueCellFormat } from '../RevenueTable/types'
import { RevenueTable } from '..'
import type { IReservationRevenue } from 'types/revenue'

interface Props {
  nights: string
  revenue: IReservationRevenue
}

const RevenueDisplay = ({ revenue, nights }: Props) => {
  return (
    <>
      {revenue && (
        <RevenueTable hideShare={true}>
          <RevenueRow type={RevenueRowType.Item}>
            <RevenueCell>
              <Text>
                {`${nights} x ${formatCurrency(
                  revenue.accommodationRevenue.roomRate
                )} avg. per night`}
              </Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>
                {formatCurrency(
                  revenue.accommodationRevenue.roomRateTotal.amount
                )}
              </Text>
            </RevenueCell>
          </RevenueRow>

          {revenue.guestFeeRevenue.guestFees.map((fee, index) => (
            <RevenueRow type={RevenueRowType.Item} key={index}>
              <RevenueCell>
                <Text>{fee.name}</Text>
              </RevenueCell>
              <RevenueCell format={RevenueCellFormat.Currency}>
                <Text>{formatCurrency(fee.amount.amount)}</Text>
              </RevenueCell>
            </RevenueRow>
          ))}
          <RevenueRow type={RevenueRowType.Item}>
            <RevenueCell>
              <Text>Taxes</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>
                {formatCurrency(
                  revenue.allTaxes.reduce(
                    (acc2, cur2) => acc2 + (cur2?.value.amount || 0),
                    0
                  )
                )}
              </Text>
            </RevenueCell>
          </RevenueRow>
          <RevenueRow type={RevenueRowType.Summary}>
            <RevenueCell>
              <Text>Total cost to guest</Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>{formatCurrency(revenue.grossBookingValue.amount)}</Text>
            </RevenueCell>
          </RevenueRow>
          {revenue.accommodationRevenue.discount.amount > 0 && (
            <>
              <RevenueRow type={RevenueRowType.Item}>
                <RevenueCell>
                  <Text>Discount</Text>
                </RevenueCell>
                <RevenueCell format={RevenueCellFormat.Currency}>
                  <Text>
                    {formatCurrency(
                      revenue.accommodationRevenue.discount.amount
                    )}
                  </Text>
                </RevenueCell>
              </RevenueRow>
              <RevenueRow type={RevenueRowType.Summary}>
                <RevenueCell>
                  <Text>Total cost to guest after discount</Text>
                </RevenueCell>
                <RevenueCell format={RevenueCellFormat.Currency}>
                  <Text>
                    {formatCurrency(
                      revenue.accommodationRevenue.netRevenue.amount
                    )}
                  </Text>
                </RevenueCell>
              </RevenueRow>
            </>
          )}
        </RevenueTable>
      )}
    </>
  )
}

export default RevenueDisplay
