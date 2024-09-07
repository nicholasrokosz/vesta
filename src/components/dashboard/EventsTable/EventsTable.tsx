import { Stack, Table, Text, Center } from '@mantine/core'
import { DateTime } from 'luxon'
import { formatTimeWithZone } from 'utils/dateFormats'

interface Props {
  events: {
    listingName: string
    listingTimeZone: string
    fromDate: Date
    toDate: Date
    guestName: string
    numGuests: string
  }[]
  checkIn?: boolean
}

const EventsTable = ({ events, checkIn = false }: Props) => {
  return (
    <Stack>
      <Table>
        <tbody>
          {events.map((event, index) => (
            <tr key={index}>
              <td>
                <Text>{event.listingName}</Text>
              </td>
              <td>
                <Text>{event.guestName}</Text>
              </td>
              <td>
                <Text>{event.numGuests}</Text>
              </td>
              <td>
                <Text>
                  {checkIn
                    ? `${DateTime.fromJSDate(event.fromDate).toFormat(
                        'MM/dd'
                      )} ${formatTimeWithZone(
                        event.fromDate,
                        event.listingTimeZone
                      )}`
                    : `${DateTime.fromJSDate(event.toDate).toFormat(
                        'MM/dd'
                      )} ${formatTimeWithZone(
                        event.fromDate,
                        event.listingTimeZone
                      )}`}
                </Text>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {events.length === 0 && <Center>No events</Center>}
    </Stack>
  )
}

export default EventsTable
