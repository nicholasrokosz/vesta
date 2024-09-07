import { useState } from 'react'
import { Flex, Stack, Text, createStyles } from '@mantine/core'
import type { MbscPageLoadingEvent } from '@mobiscroll/react'
import {
  Eventcalendar,
  CalendarToday,
  CalendarPrev,
  CalendarNext,
} from '@mobiscroll/react'
import { IconCalendarTime } from '@tabler/icons-react'

import type { ICalendarEvent } from 'types/calendar'
import { CalendarEvent, CalendarEventDetail } from 'components/calendar'
import VestaModal from 'components/common/Modal/Modal'
import { DateTime } from 'luxon'
import type { EventcalendarBase } from '@mobiscroll/react/dist/src/core/components/eventcalendar/eventcalendar'
import type DateString from 'types/dateString'

interface Props {
  events: {
    start: Date
    end: Date
    event: ICalendarEvent
    resource: string
  }[]
  prices: {
    start: DateString
    end: DateString
    event: ICalendarEvent | undefined
    resource: string
  }[]
  onDateRangeChange: (
    args: MbscPageLoadingEvent,
    inst: EventcalendarBase
  ) => void
  onDateSelected: (date: Date) => void
  onEventDeleted: () => void
  disableEdits?: boolean
}

const useStyles = createStyles((theme) => ({
  year: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  icon: {
    color: theme.colors.gray[6],
  },
}))

const ListingCalendar = ({
  events,
  prices,
  disableEdits,
  onDateRangeChange,
  onDateSelected,
  onEventDeleted,
}: Props) => {
  const { classes } = useStyles()
  const [selectedEvent, setSelectedEvent] = useState<ICalendarEvent | null>()
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  const [year, setYear] = useState<string>(DateTime.now().toFormat('MMMM yyyy'))

  return (
    <div>
      {selectedEvent && (
        <VestaModal
          opened={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedEvent(null)
          }}
          size={300}
        >
          <CalendarEventDetail
            event={selectedEvent}
            onComplete={() => {
              setShowDetailModal(false)
              onEventDeleted()
            }}
            disableEdits={disableEdits}
          />
        </VestaModal>
      )}

      <Eventcalendar
        rangeStart={3}
        selectedDate={new Date(new Date().toLocaleDateString())}
        cssClass="md-book-rental"
        themeVariant="light"
        firstDay={1}
        data={[...events, ...prices]}
        refDate={new Date(new Date().setDate(new Date().getDate() - 1))}
        renderHeader={() => {
          return (
            <Stack spacing={'xs'}>
              <Flex
                align={'center'}
                justify={'center'}
                className={classes.year}
              >
                {year}
              </Flex>
              <Flex
                mih={50}
                gap="md"
                justify="space-between"
                align="center"
                direction="row"
              >
                <CalendarPrev />
                <CalendarToday />
                <CalendarNext />
              </Flex>
            </Stack>
          )
        }}
        renderLabel={(event) => {
          if (event.original?.event) {
            return (
              <CalendarEvent
                size={'sm'}
                event={event.original?.event as ICalendarEvent}
              />
            )
          } else {
            return (
              <Stack className="vesta-price">
                <Flex direction="column" justify="flex-end" pt={10}>
                  <Text>
                    {(event.original?.resource as string).split('#')[0]}
                  </Text>
                  <Flex direction="row" justify="flex-end">
                    <Flex direction="row" align="center">
                      <IconCalendarTime className={classes.icon} size="15" />
                      <Text ml={1}>
                        {(event.original?.resource as string).split('#')[1]}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Stack>
            )
          }
        }}
        view={{
          calendar: {
            type: 'month',
            size: 1,
            popover: false,
            outerDays: true,
            labels: true,
          },
        }}
        showEventTooltip={false}
        onEventClick={(event) => {
          if (event?.event?.event) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setSelectedEvent(event.event.event)
            setShowDetailModal(true)
          } else {
            setSelectedEvent(null)
            setShowDetailModal(false)
            onDateSelected(event.date)
          }
        }}
        onPageLoading={onDateRangeChange}
        onPageChange={(event) => {
          setYear(
            DateTime.fromJSDate(event.month || event.firstDay).toFormat(
              'MMMM yyyy'
            )
          )
        }}
      />
    </div>
  )
}

export default ListingCalendar
