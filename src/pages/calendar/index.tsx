import { useState, useEffect, useCallback } from 'react'
import {
  useMantineTheme,
  createStyles,
  Title,
  Flex,
  Group,
  Button,
  Modal,
  Stack,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  CalendarEvent,
  CalendarEventDetail,
  CreateEvent,
} from 'components/calendar'
import type { ICalendarEvent } from 'types/calendar'
import type { MbscPageLoadingEvent } from '@mobiscroll/react'
import {
  Eventcalendar,
  CalendarToday,
  CalendarPrev,
  CalendarNext,
} from '@mobiscroll/react'
import { DateTime } from 'luxon'

import { api } from 'utils/api'
import VestaModal from 'components/common/Modal/Modal'
import Link from 'next/link'
import DateString from 'types/dateString'

const useStyles = createStyles(() => ({
  header: {
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 26,
    lineHeight: '135%',
  },
}))

const CalendarPage = () => {
  const [dateRange, setDateRange] = useState<{
    startDateIso: string | null
    endDateIso: string | null
  }>({
    startDateIso: null,
    endDateIso: null,
  })

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = api.calendar.getAll.useQuery(
    {
      start: dateRange.startDateIso,
      end: dateRange.endDateIso,
    },
    {
      enabled: !!dateRange.startDateIso && !!dateRange.endDateIso,
    }
  )
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const mobileView = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  const [mobiPrices, setMobiPrices] = useState<
    {
      date: Date
      title: string
      cssClass: string
      background: string
      resource: string
    }[]
  >([])

  const [mobiEvents, setMobiEvents] = useState<
    { start: Date; end: Date; event: ICalendarEvent; resource: string }[]
  >([])
  const [mobiListings, setMobiListings] = useState<
    { id: string; name: string }[]
  >([])

  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent>()
  const [selectedListingDate, setSelectedListingDate] =
    useState<[listingId: string, date: DateString]>()
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)

  const isToday = (pricingDate: DateString) => {
    return pricingDate.matchesDate(new Date())
  }

  const onDateRangeChange = useCallback((event: MbscPageLoadingEvent) => {
    const startDateIso = event.firstDay.toISOString().split('T')[0]
    const endDateIso = event.lastDay.toISOString().split('T')[0]

    setDateRange({ startDateIso, endDateIso })
  }, [])

  useEffect(() => {
    if (!eventsData?.events || eventsLoading) return

    const prices = eventsData.prices
      .map((price) => {
        const dateString = DateString.fromString(price.date)

        return {
          date: dateString.toDate(),
          dateString,
          title: `$${price.price}`,
          resource: price.listingId,
          cssClass: 'vesta-price',
          background: isToday(dateString) ? '#F4F4F6' : 'white',
          listingId: price.listingId,
        }
      })
      .filter(
        (p) =>
          !eventsData.events.some(
            (e) =>
              e.listingId === p.listingId &&
              p.dateString.compareToDate(e.fromDate) >= 0 &&
              p.dateString.compareToDate(e.toDate) <= 0
          )
      )

    setMobiEvents(
      eventsData.events.map((event) => {
        return {
          start: event.fromDate,
          end: event.toDate,
          event: event,
          resource: event.listingId,
        }
      })
    )
    setMobiListings(eventsData.listings)

    const todayColors: {
      date: Date
      title: string
      cssClass: string
      background: string
      resource: string
    }[] = []

    eventsData.listings.forEach((listing: { id: string; name: string }) => {
      const todayPrice = prices.find((price) => {
        if (isToday(price.dateString) && price.resource === listing.id) {
          return price
        }
      })

      if (!todayPrice) {
        todayColors.push({
          date: new Date(),
          title: '',
          resource: listing.id,
          cssClass: '',
          background: '#F4F4F6',
        })
      }
    })

    setMobiPrices([...todayColors, ...prices])
  }, [eventsData])

  const checkExcluded = (listingId: string, date: Date) => {
    return mobiEvents.some((event) => {
      return (
        event.resource === listingId &&
        new Date(date.toDateString()) >= new Date(event.start.toDateString()) &&
        new Date(date.toDateString()) < new Date(event.end.toDateString())
      )
    })
  }

  useEffect(() => {
    if (!selectedListingDate) return
    if (checkExcluded(selectedListingDate[0], selectedListingDate[1].toDate()))
      return

    setShowCreateModal(true)
  }, [mobiEvents, selectedListingDate])

  const PolymorphicModal = mobileView ? Modal : VestaModal

  const closeCreate = () => {
    setShowCreateModal(false)
    setSelectedListingDate(undefined)
  }

  return (
    <div>
      <Title order={1} className={classes.header}>
        Calendar
      </Title>

      <PolymorphicModal
        opened={showCreateModal}
        onClose={() => closeCreate()}
        size={800}
        title="Create new event"
        // pb='xxxl'
      >
        <Stack>
          <CreateEvent
            listingDate={selectedListingDate}
            onComplete={() => {
              closeCreate()
              void refetchEvents()
            }}
          />
        </Stack>
      </PolymorphicModal>

      {selectedEvent && (
        <Modal
          opened={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          size={300}
        >
          <CalendarEventDetail
            event={selectedEvent}
            onComplete={() => {
              setShowDetailModal(false)
              void refetchEvents()
            }}
          />
        </Modal>
      )}

      <Group position="right">
        <Button onClick={() => setShowCreateModal(true)}>
          Create new event
        </Button>
      </Group>

      <Eventcalendar
        rowHeight={'variable'}
        cssClass="md-book-rental"
        themeVariant="light"
        data={mobiEvents}
        colors={mobiPrices}
        refDate={new Date(new Date().setDate(new Date().getDate() - 2))}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        renderDay={(day: any) => {
          // TODO: use unknown and type predicate

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          const date = new Date(day.date)
          const isToday = date.toDateString() === new Date().toDateString()
          const dayFormatted = DateTime.fromJSDate(date).toFormat('EEE')
          const dayNumber = DateTime.fromJSDate(date).toFormat('d')
          return (
            <div className={`vesta-day ${isToday ? 'today' : ''} `}>
              <span>{dayFormatted}</span>
              <span className={`vesta-number ${isToday ? 'today' : ''}`}>
                {dayNumber}
              </span>
            </div>
          )
        }}
        renderHeader={() => {
          return (
            <Flex
              mih={50}
              gap="md"
              justify="flex-end"
              align="flex-start"
              direction="row"
            >
              <CalendarPrev />
              <CalendarToday />
              <CalendarNext />
            </Flex>
          )
        }}
        renderScheduleEvent={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          return <CalendarEvent event={event.original?.event} />
        }}
        renderResource={(resource) => {
          return <Link href={`listings/${resource.id}`}>{resource.name}</Link>
        }}
        view={{
          timeline: {
            type: 'day',
            eventList: false,
            resolution: 'day',
            size: 12,
            rowHeight: 'equal',
          },
        }}
        resources={mobiListings}
        showEventTooltip={false}
        onPageLoading={onDateRangeChange}
        onCellClick={(event) => {
          setSelectedListingDate([
            event.resource as string,
            DateString.fromDate(event.date),
          ])
        }}
        onEventClick={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setSelectedEvent(event.event.event)
          setShowDetailModal(true)
        }}
      />
    </div>
  )
}

export default CalendarPage
