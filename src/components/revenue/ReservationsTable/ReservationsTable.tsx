import { Table, Text, createStyles, Avatar, Group } from '@mantine/core'
import { v4 as uuidv4 } from 'uuid'
import ChannelTag from 'components/common/ChannelTag/ChannelTag'
import Link from 'next/link'
import type { IRevenueEvent } from 'types/revenue'
import { formatCurrency } from 'utils/formatCurrency'

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
  },
  th: {
    border: 'none !important',
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

interface ITableColumn {
  label: string
  key: string
  format: string
}

interface Props {
  events: IRevenueEvent[]
  columns: ITableColumn[]
}

const ReservationRow = (event: IRevenueEvent) => {
  const { classes } = useStyles()
  const url = `/financials/revenue/${event.id}`

  return (
    <tr>
      <td>
        <Link href={url} className={classes.link}>
          <Group noWrap>
            <Avatar src={event.listingPhoto} radius="xl" />
            <div>{event.listingName}</div>
          </Group>
        </Link>
      </td>
      <td>
        {event.channel && (
          <Link href={url} className={classes.link}>
            <ChannelTag channel={event.channel} showText={true} />
          </Link>
        )}
      </td>
      <td>
        <Link href={url} className={classes.link}>
          {event.name}
        </Link>
      </td>
      <td>
        <Link href={url} className={classes.link}>
          {event.status}
        </Link>
      </td>
      <td>
        <Link href={url} className={classes.link}>
          {event.fromDate.toFormattedString()}
        </Link>
      </td>
      <td>
        <Link href={url} className={classes.link}>
          {event.toDate.toFormattedString()}
        </Link>
      </td>
      <td>
        <Link href={url} className={classes.link}>
          {event.confirmationCode}
        </Link>
      </td>
      <td className={classes.currency}>
        <Link href={url} className={classes.link}>
          {formatCurrency(event.revenue.grossBookingValue.amount)}
        </Link>
      </td>
    </tr>
  )
}

const ReservationsTable = ({ events, columns }: Props) => {
  const { classes } = useStyles()

  return (
    <Table highlightOnHover fontSize="sm">
      <thead className={classes.header}>
        <tr>
          {columns.map((column: ITableColumn) => (
            <th className={classes.header} key={uuidv4()}>
              <Text align={column.format == 'currency' ? 'right' : 'left'}>
                {column.label}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {events?.map((event) => (
          <ReservationRow key={uuidv4()} {...event} />
        ))}
      </tbody>
    </Table>
  )
}

export default ReservationsTable
