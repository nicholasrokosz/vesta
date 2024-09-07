import {
  Stack,
  Group,
  Box,
  Title,
  Text,
  Flex,
  createStyles,
} from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { DateTime } from 'luxon'
import { IconMoodKid, IconUser } from '@tabler/icons-react'

import type { ICalendarEvent } from 'types/calendar'
import ScheduledMessage from '../ScheduledMessage/ScheduledMessage'
import ChannelTag from 'components/common/ChannelTag/ChannelTag'
import { formatTimeWithZone } from 'utils/dateFormats'
import type { CalendarEventTypeType } from '../../../../prisma/generated/zod'
import { useState } from 'react'
import { api } from 'utils/api'
const useStyles = createStyles((theme) => ({
  date: {
    color: 'black',
    border: '1px solid white',
    borderRadius: theme.radius.md,
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
  },
  mainResDate: {
    backgroundColor: theme.colors.vesta[4],
    color: theme.white,
  },
  otherResDate: {
    backgroundColor: theme.colors.vesta[1],
  },
  blockedDate: {
    backgroundColor: '#FFF1BB',
  },
  image: {
    paddingBottom: theme.spacing.sm,
  },
  address: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[9],
    opacity: 0.5,
  },
  checkInLabel: {
    color: '#9DA3AF',
    fontWeight: 700,
  },
  checkInDate: {
    fontWeight: 600,
    fontSize: theme.fontSizes.md,
  },
  person: {
    color: theme.colors.gray[6],
  },
  personIcon: {
    marginRight: theme.spacing.xs,
    color: theme.colors.gray[6],
  },
}))

interface Props {
  event: ICalendarEvent
  listingId: string
}

const Overview = ({ event, listingId }: Props) => {
  const { classes, cx } = useStyles()

  const [dateRange, setDateRange] = useState<{
    startDateIso: string | null
    endDateIso: string | null
  }>({
    startDateIso: DateTime.fromJSDate(event.fromDate)
      .startOf('month')
      .startOf('week')
      .toISODate(),
    endDateIso: DateTime.fromJSDate(event.toDate)
      .endOf('month')
      .endOf('week')
      .toISODate(),
  })

  const { data: listingEvents } = api.calendar.getAllByListing.useQuery({
    id: listingId,
    start: dateRange.startDateIso,
    end: dateRange.endDateIso,
  })

  const dateInRange = (date: Date, start: Date, end: Date) =>
    new Date(date.toDateString()) >= new Date(start.toDateString()) &&
    new Date(date.toDateString()) < new Date(end.toDateString())

  const getBlockType = (date: Date) => {
    let blockType: CalendarEventTypeType | 'Main' | undefined = undefined
    listingEvents?.events.forEach((e) => {
      if (dateInRange(date, e.fromDate, e.toDate)) {
        blockType = e.id === event.id ? 'Main' : e.type
      }
    })
    return blockType
  }

  const renderScheduledMessages = (
    messages: {
      scheduledAt: Date
      status: string
      title: string
    }[]
  ) => {
    return (
      <Stack mt="sm">
        <Title order={5}>Scheduled messages</Title>

        {!messages.length ? (
          <Text italic>No scheduled messages.</Text>
        ) : (
          <Stack w={'100%'} spacing={'xs'}>
            {messages.map((message, i) => (
              <ScheduledMessage
                message={message}
                key={i}
                timeZone={event.listingTimeZone}
              />
            ))}
          </Stack>
        )}
      </Stack>
    )
  }

  return (
    <Box px="lg" pt={0} pb={100}>
      <Flex direction={'row'} justify={'flex-start'} pb="md" wrap="wrap">
        <Flex direction={'column'} w={'100%'} bgr={'cyan'}>
          <Title lineClamp={2} order={5}>
            {event.listingName}
          </Title>
          <span className={classes.address}>Owner: {event.listingOwner}</span>
          <span className={classes.address}>
            {event.listingUnitType} • {event.listingAddress}
          </span>
        </Flex>
      </Flex>
      <Stack w={'100%'} justify="flex-start" spacing="xs">
        <ChannelTag channel={event.reservation?.channel} showText={true} />
        <Flex direction={'row'} justify={'space-between'} mb={24}>
          <div>
            <div className={classes.checkInLabel}>Check-in</div>
            <div className={classes.checkInDate}>
              {DateTime.fromJSDate(event.fromDate).toFormat('MMM d yyyy')}
            </div>
            {formatTimeWithZone(event.fromDate, event.listingTimeZone)}
          </div>
          <div>
            <div className={classes.checkInLabel}>Checkout</div>
            <div className={classes.checkInDate}>
              {DateTime.fromJSDate(event.toDate).toFormat('MMM d yyyy')}
            </div>
            {formatTimeWithZone(event.toDate, event.listingTimeZone)}
          </div>
        </Flex>
        <Flex direction={'row'} justify={'space-evenly'} mb="lg">
          <Flex align={'center'} justify={'space-between'}>
            <IconUser className={classes.personIcon} />
            <span className={classes.person}>Adults</span>
            <Text fw={'bold'} ml="xs">
              {event.reservation?.adults}
            </Text>
          </Flex>
          <Flex align={'center'} justify={'space-between'}>
            <IconMoodKid className={classes.personIcon} />
            <span className={classes.person}>Kids</span>
            <Text fw={'bold'} ml="xs">
              {event.reservation?.adults}
            </Text>
          </Flex>
        </Flex>
      </Stack>
      <Group position="center" w={'100%'}>
        <Calendar
          defaultDate={event.fromDate}
          size="md"
          onDateChange={(date) => {
            setDateRange({
              startDateIso: DateTime.fromJSDate(date)
                .startOf('month')
                .startOf('week')
                .toISODate(),
              endDateIso: DateTime.fromJSDate(date)
                .endOf('month')
                .endOf('week')
                .toISODate(),
            })
          }}
          renderDay={(date) => {
            const blockType = getBlockType(date)
            const day = date.getDate()
            return (
              <Box
                className={cx(classes.date, {
                  [classes.mainResDate]: blockType === 'Main',
                  [classes.otherResDate]: blockType === 'Reservation',
                  [classes.blockedDate]: blockType === 'Blocked',
                })}
              >
                {day}
              </Box>
            )
          }}
        />
      </Group>

      {!event.reservation?.scheduledMessages ? (
        <Text italic>No scheduled messages</Text>
      ) : (
        renderScheduledMessages(event.reservation?.scheduledMessages || [])
      )}
    </Box>
  )
}

export default Overview
