import { Stack, Table, Text, Title, createStyles } from '@mantine/core'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import type {
  IGuestFeeRevenue,
  IGuestFeeRevenueItem,
} from 'types/ownerstatement'
import { formatCurrency } from 'utils/formatCurrency'
import formatShareToPercentage from 'utils/formatShareToPercentage'

const useStyles = createStyles((theme) => ({
  th: {
    border: 'none !important',
  },
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  total: {
    backgroundColor: theme.colors.gray[1],
    fontWeight: 600,
  },
  currency: {
    textAlign: 'right',
    paddingRight: 8,
  },
}))

interface Props {
  guestFeeRevenue: IGuestFeeRevenue
}

const GuestFeeRevenueRow = (fee: IGuestFeeRevenueItem) => {
  const { classes } = useStyles()
  const managerPercentage = fee.netRevenue.managerShare * 100
  const ownerPercentage = 100 - managerPercentage

  return (
    <tr>
      <td>{DateTime.fromJSDate(fee.checkOut).toFormat('MMM dd yyyy')}</td>
      <td>{fee.feeType}</td>
      <td>{fee.confirmationCode}</td>
      <td className={classes.currency}>{formatCurrency(fee.paidByGuest)}</td>
      <td className={classes.currency}>
        {formatCurrency(fee.netRevenue.amount)}
      </td>
      <td className={classes.currency}>
        {formatCurrency(fee.netRevenue.managerAmount)} (
        {managerPercentage % 1 != 0
          ? managerPercentage.toFixed(1)
          : managerPercentage}
        %)
      </td>
      <td className={classes.currency}>
        {formatCurrency(fee.netRevenue.ownerAmount)} (
        {ownerPercentage % 1 != 0
          ? ownerPercentage.toFixed(1)
          : ownerPercentage}
        %)
      </td>
    </tr>
  )
}

const GuestFeeRevenueTable = ({ guestFeeRevenue }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = [
    { label: 'Checkout Date', key: 'checkout', format: 'string' },
    { label: 'Fee type', key: 'feetype', format: 'string' },
    { label: 'Confirmation code', key: 'confirmationcode', format: 'string' },
    { label: 'Paid by guest', key: 'paidByGuest', format: 'currency' },
    { label: 'Net revenue', key: 'netRevenue', format: 'currency' },
    { label: 'PM proceeds', key: 'pmProceeds', format: 'currency' },
    { label: 'Owner proceeds', key: 'ownerProceeds', format: 'currency' },
  ]

  const netRevenue = guestFeeRevenue.netRevenue

  return (
    <Stack>
      <Title order={1}>Guest fee revenue</Title>
      <Table highlightOnHover striped>
        <thead className={classes.header}>
          <tr>
            {COLUMNS.map((column) => (
              <th className={classes.th} key={column.key}>
                <Text align={column.format == 'currency' ? 'right' : 'left'}>
                  {column.label}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {guestFeeRevenue.items.map((fee) => {
            if (fee) return <GuestFeeRevenueRow {...fee} key={uuidv4()} />
          })}

          <tr className={classes.total}>
            <td>Total</td>
            <td>-</td>
            <td>-</td>
            <td className={classes.currency}>
              {formatCurrency(guestFeeRevenue.paidByGuest)}
            </td>
            <td className={classes.currency}>
              {formatCurrency(netRevenue.amount)}
            </td>
            <td className={classes.currency}>
              {formatCurrency(netRevenue.managerAmount)}
              {formatShareToPercentage(netRevenue.managerShare)}
            </td>
            <td className={classes.currency}>
              {formatCurrency(netRevenue.ownerAmount)}
              {formatShareToPercentage(netRevenue.ownerShare)}
            </td>
          </tr>
        </tbody>
      </Table>
    </Stack>
  )
}

export default GuestFeeRevenueTable
