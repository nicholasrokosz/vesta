import { Box, Flex, Text } from '@mantine/core'
import type { IReservationRevenue } from 'types/revenue'
import { formatCurrency } from 'utils/formatCurrency'
import RevenueCell from './RevenueCell'
import RevenueRow from './RevenueRow'
import { RevenueCellFormat, RevenueRowType } from './types'
import { useToggle } from '@mantine/hooks'
import RevenueActionCell from './RevenueActionCell'
import Info from 'components/common/Info/Info'

interface Props {
  revenue: IReservationRevenue
}

const GrossBookingValueRollupRow = ({ revenue }: Props) => {
  const [open, toggleOpen] = useToggle([false, true] as const)

  return (
    <>
      <RevenueRow type={RevenueRowType.Summary}>
        <RevenueActionCell
          label={
            <Text fw="bold">
              Gross booking value (paid by guest){' '}
              <Info label="Gross booking value excludes any channel fees paid directly by the guest" />
            </Text>
          }
          open={open}
          toggleOpen={toggleOpen}
        />
        <RevenueCell format={RevenueCellFormat.Currency}>
          <Text>{formatCurrency(revenue.grossBookingValue.amount)}</Text>
        </RevenueCell>
        <RevenueCell format={RevenueCellFormat.Currency}>
          {formatCurrency(revenue.grossBookingValue.managerAmount)}
        </RevenueCell>
        <RevenueCell format={RevenueCellFormat.Currency}>
          {formatCurrency(revenue.grossBookingValue.ownerAmount)}
        </RevenueCell>
      </RevenueRow>
      {open && (
        <>
          <RevenueRow>
            <RevenueCell>
              <Flex>
                <Box w="xl"></Box>
                <Text>Gross accommodation revenue</Text>
              </Flex>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>
                {formatCurrency(
                  revenue.accommodationRevenue.grossRevenue.amount
                )}
              </Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {formatCurrency(
                revenue.accommodationRevenue.grossRevenue.managerAmount
              )}
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {formatCurrency(
                revenue.accommodationRevenue.grossRevenue.ownerAmount
              )}
            </RevenueCell>
          </RevenueRow>
          <RevenueRow>
            <RevenueCell>
              <Flex>
                <Box w="xl"></Box>
                <Text>Gross guest fees revenue</Text>
              </Flex>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              <Text>
                {formatCurrency(revenue.guestFeeRevenue.guestFeesGross.amount)}
              </Text>
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {formatCurrency(
                revenue.guestFeeRevenue.guestFeesGross.managerAmount
              )}
            </RevenueCell>
            <RevenueCell format={RevenueCellFormat.Currency}>
              {formatCurrency(
                revenue.guestFeeRevenue.guestFeesGross.ownerAmount
              )}
            </RevenueCell>
          </RevenueRow>
        </>
      )}
    </>
  )
}

export default GrossBookingValueRollupRow
