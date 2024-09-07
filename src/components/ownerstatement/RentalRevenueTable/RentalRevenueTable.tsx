import { Stack, Table, Text, Title, createStyles } from '@mantine/core'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import type {
  IAccommodationRevenue,
  IAccommodationReservation,
} from 'types/ownerstatement'
import { formatCurrency } from 'utils/formatCurrency'
import formatShareToPercentage from 'utils/formatShareToPercentage'
import Link from 'next/link'

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
  link: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
}))

interface Props {
  accommodationRevenue: IAccommodationRevenue
}

const RentalRevenueRow = (reservation: IAccommodationReservation) => {
  const { classes } = useStyles()
  const link = `/financials/revenue/${reservation.id}`

  const netRevenue = reservation.netRevenue

  return (
    <tr>
      <td>
        <Link href={link} className={classes.link}>
          {reservation.confirmationCode}
        </Link>
      </td>
      <td>
        <Link href={link} className={classes.link}>
          {reservation.channel}
        </Link>
      </td>
      <td>
        <Link href={link} className={classes.link}>
          {reservation.numGuests}
        </Link>
      </td>
      <td>
        <Link href={link} className={classes.link}>
          {DateTime.fromJSDate(reservation.checkIn).toFormat('MMM dd yyyy')}
        </Link>
      </td>
      <td>
        <Link href={link} className={classes.link}>
          {DateTime.fromJSDate(reservation.checkOut).toFormat('MMM dd yyyy')}
        </Link>
      </td>
      <td>
        <Link href={link} className={classes.link}>
          {reservation.numberOfNights}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={link} className={classes.link}>
          {formatCurrency(reservation.avgNightlyRate)}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={link} className={classes.link}>
          {formatCurrency(reservation.guestPaid)}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={link} className={classes.link}>
          {formatCurrency(netRevenue.amount)}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={link} className={classes.link}>
          {formatCurrency(netRevenue.managerAmount)}
          {formatShareToPercentage(netRevenue.managerShare)}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={link} className={classes.link}>
          {formatCurrency(netRevenue.ownerAmount)}
          {formatShareToPercentage(netRevenue.ownerShare)}
        </Link>
      </td>
    </tr>
  )
}

const RentalRevenueTable = ({ accommodationRevenue }: Props) => {
  const { classes } = useStyles()

  const COLUMNS = [
    { label: 'Confirmation code', key: 'confirmationCode', format: 'string' },
    { label: 'Channel', key: 'channel', format: 'string' },
    { label: 'Guests', key: 'guests', format: 'string' },
    { label: 'Check-In', key: 'checkin', format: 'string' },
    { label: 'Checkout', key: 'checkout', format: 'string' },
    { label: 'Nights', key: 'nights', format: 'string' },
    { label: 'Guest nightly rate', key: 'rate', format: 'currency' },
    { label: 'Paid by guest', key: 'paidGuest', format: 'currency' },
    { label: 'Net revenue', key: 'netRevenue', format: 'currency' },
    { label: 'PM proceeds', key: 'pmProceeds', format: 'currency' },
    { label: 'Owner proceeds', key: 'ownerProceeds', format: 'currency' },
  ]

  const netRevenue = accommodationRevenue.netRevenue

  return (
    <Stack>
      <Title order={1}>Accommodation revenue</Title>
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
          {accommodationRevenue.reservations.map((reservation) => {
            if (reservation)
              return <RentalRevenueRow {...reservation} key={uuidv4()} />
          })}

          <tr className={classes.total}>
            <td>Total</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>{accommodationRevenue.numberOfNights}</td>
            <td className={classes.currency}>
              {formatCurrency(accommodationRevenue.avgNightlyRate)}{' '}
            </td>
            <td className={classes.currency}>
              {formatCurrency(accommodationRevenue.guestPaid)}
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

export default RentalRevenueTable
