import { type NextPage } from 'next'
import { api } from 'utils/api'
import ListingCalendar from 'components/listings/ListingCalendar/ListingCalendar'
import SelectSingleOwner from 'components/listings/SelectListing/SingleOwner'
import { useCallback, useEffect, useState } from 'react'
import type { ICalendarEvent } from 'types/calendar'
import type { MbscPageLoadingEvent } from '@mobiscroll/react'
import DateString from 'types/dateString'

const OwnerCalendar: NextPage = () => {
  const [listingId, setListingId] = useState<string>('')

  const [dateRange, setDateRange] = useState<{
    startDateIso: string | null
    endDateIso: string | null
  }>({
    startDateIso: null,
    endDateIso: null,
  })

  const { data: eventsData, isLoading: eventsLoading } =
    api.owner.getEventsForListing.useQuery(
      {
        id: listingId,
        start: dateRange.startDateIso,
        end: dateRange.endDateIso,
      },
      {
        enabled:
          !!listingId && !!dateRange.startDateIso && !!dateRange.endDateIso,
      }
    )

  const [mobiEvents, setMobiEvents] = useState<
    {
      start: Date
      end: Date
      event: ICalendarEvent
      resource: string
    }[]
  >([])
  const [pricesByDay, setPricesByDay] = useState<
    {
      start: DateString
      end: DateString
      event: ICalendarEvent | undefined
      resource: string
    }[]
  >([])

  useEffect(() => {
    if (!eventsData?.events || eventsLoading) return

    const listingEvents = eventsData.events.map((event: ICalendarEvent) => {
      return {
        start: event.fromDate,
        end: event.toDate,
        event: event,
        resource: event.listingId,
      }
    })

    const listingPricesByDay = eventsData.prices
      .map((price) => {
        const dateString = DateString.fromString(price.date)
        return {
          start: dateString,
          end: dateString,
          event: undefined,
          resource: `$${price.price}`,
          listingId: price.listingId,
        }
      })
      .filter(
        (p) =>
          !eventsData.events.some(
            (e) =>
              e.listingId === p.listingId &&
              p.start.compareToDate(e.fromDate) >= 0 &&
              p.start.compareToDate(e.toDate) <= 0
          )
      )

    setPricesByDay(listingPricesByDay)
    setMobiEvents(listingEvents)
  }, [eventsData, eventsLoading])

  const onDateRangeChange = useCallback((event: MbscPageLoadingEvent) => {
    const startDateIso = event.firstDay.toISOString().split('T')[0]
    const endDateIso = event.lastDay.toISOString().split('T')[0]

    setDateRange({ startDateIso, endDateIso })
  }, [])

  return (
    <>
      <SelectSingleOwner displayLabel excludeIds={[]} onSelect={setListingId} />

      <ListingCalendar
        events={mobiEvents || []}
        prices={pricesByDay || []}
        onDateRangeChange={onDateRangeChange}
        onDateSelected={() => {
          return
        }}
        onEventDeleted={() => {
          return
        }}
        disableEdits={true}
      />
    </>
  )
}

export default OwnerCalendar
