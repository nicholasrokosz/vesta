import { Button, Group, Stack, Textarea } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import SelectListing from 'components/listings/SelectListing/Single'
import { useState, useEffect } from 'react'
import type { CalendarEvent } from 'types/calendar'
import DateString from 'types/dateString'
import { api } from 'utils/api'
import CalendarEventDatePicker from '../CalendarEventDatePicker/CalendarEventDatePicker'

interface Props {
  listingDate: [listingId: string, date: DateString | undefined] | undefined
  onComplete: () => void
}

const CreateUnavailable = ({ listingDate, onComplete }: Props) => {
  const [listingId, setListingId] = useState<string | null>(
    listingDate?.[0] ?? null
  )
  const [dates, setDates] = useState<[DateString | null, DateString | null]>([
    listingDate?.[1] ?? null,
    null,
  ])
  const [saveDisabled, setsaveDisabled] = useState<boolean>(false)
  const [notes, setNotes] = useState('')

  const isValid = !!listingId && !!dates[1]

  const blockedMutation = api.calendar.createEvent.useMutation()
  const { data: blockedData } = api.calendar.getBlockedDates.useQuery(
    {
      listingId: listingId || '',
    },
    { enabled: !!listingId }
  )

  const submit = () => {
    if (!listingId || !dates[0] || !dates[1]) return

    setsaveDisabled(true)

    const calendarEvent: CalendarEvent = {
      type: 'Blocked',
      listingId: listingId,
      fromDate: dates[0],
      toDate: dates[1],
      notes: notes,
    }

    blockedMutation.mutate({
      ...calendarEvent,
      fromDate: calendarEvent.fromDate.toString(),
      toDate: calendarEvent.toDate.toString(),
    })
  }

  useEffect(() => {
    if (blockedMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Unavailability block created.',
        color: 'teal',
      })
      setsaveDisabled(false)
      onComplete()
    }
    if (blockedMutation.isError) {
      showNotification({
        title: '',
        message:
          'An error occurred creating the Unavailability block, please try again later.',
        color: 'red',
      })
      setsaveDisabled(false)
    }
  }, [blockedMutation.isSuccess, blockedMutation.isError])

  const prices = blockedData?.prices.map((price) => ({
    date: DateString.fromString(price.date),
    price: price.price,
    minStay: price.minStay,
  }))

  return (
    <Stack>
      <SelectListing
        excludeIds={[]}
        selectedId={listingId}
        onSelect={setListingId}
        disabled={!!listingDate?.[0]}
      />

      <CalendarEventDatePicker
        blockedStartDates={blockedData?.blockedCheckIn}
        blockedEndDates={blockedData?.blockedCheckOut}
        prices={prices}
        disabled={!listingId}
        onSetDates={setDates}
        startDate={dates?.[0]}
        disableMinDate={true}
        disableMinStay={true}
      />

      <Textarea
        w={'100%'}
        autosize
        minRows={2}
        label={'Notes'}
        value={notes}
        onChange={(e) => {
          setNotes(e.currentTarget.value)
        }}
      />

      <Group position="right" mt="xl">
        <Button onClick={submit} disabled={saveDisabled || !isValid}>
          Save
        </Button>
      </Group>
    </Stack>
  )
}

export default CreateUnavailable
