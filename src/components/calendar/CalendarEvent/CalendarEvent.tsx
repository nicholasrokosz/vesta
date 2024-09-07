import { Flex, Box } from '@mantine/core'
import type { ICalendarEvent } from 'types/calendar'
import { Text } from '@mantine/core'

import styles from './CalendarEvent.module.css'
import ChannelTag from 'components/common/ChannelTag/ChannelTag'

interface Props {
  event: ICalendarEvent
  size?: 'sm' | 'lg'
}

const CalendarEvent = ({ event, size = 'lg' }: Props) => {
  const getReservationClass = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
      case 'CONFIRMED':
        return styles.confirmed
      case 'PROVISIONAL':
      case 'RESERVED':
        return styles.pending
      case 'CANCELLED':
        return styles.cancelled
      default:
        return styles.blocked
    }
  }

  if (event.reservation) {
    return (
      <Flex
        direction={'row'}
        align="center"
        justify="flex-start"
        className={`${styles.vestaEvent} ${
          size == 'sm' ? styles.small : ''
        } ${getReservationClass(event.reservation?.status)}`}
      >
        {event.reservation.status !== 'CANCELLED' && (
          <Box mr={size == 'sm' ? 4 : 6}>
            <ChannelTag
              channel={event.reservation.channel}
              showText={false}
              grayscale={['PROVISIONAL', 'RESERVED'].includes(
                event.reservation.status
              )}
              size={size}
            />
          </Box>
        )}

        <Flex
          direction={size == 'sm' ? 'row' : 'column'}
          align={size == 'sm' ? 'center' : 'flex-start'}
        >
          <Text
            className={styles.vestaEventGuest}
            align="center"
            lineClamp={1}
            mr={4}
          >
            {event.reservation.name}
          </Text>
          <Text className={styles.vestaEventDetails}>
            ({event.reservation.guests})
          </Text>
        </Flex>
      </Flex>
    )
  } else {
    return (
      <div
        className={`${styles.vestaEvent} ${size == 'sm' ? styles.small : ''} ${
          styles.blocked
        }`}
      >
        <Text>Unavailable </Text>
        <Text className={styles.vestaEventDetails} lineClamp={1}>
          {event.notes}
        </Text>
      </div>
    )
  }
}

export default CalendarEvent
