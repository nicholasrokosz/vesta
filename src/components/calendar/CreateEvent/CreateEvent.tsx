import { Select, Stack } from '@mantine/core'
import { useState } from 'react'
import { CreateUnavailable, CreateReservation } from 'components/calendar'
import type DateString from 'types/dateString'

interface Props {
  listingDate: [listingId: string, date: DateString | undefined] | undefined
  onComplete: () => void
}

const CreateEvent = ({ listingDate, onComplete }: Props) => {
  const [eventType, setEventType] = useState<string | null>('Blocked')
  const [activeStep, setActiveStep] = useState<number>(0)

  return (
    <Stack>
      {activeStep === 0 && (
        <Select
          label="Choose an event type"
          placeholder="Pick one"
          data={[
            { value: 'Reservation', label: 'Reservation' },
            { value: 'Blocked', label: 'Unavailability Block' },
          ]}
          value={eventType}
          onChange={setEventType}
          searchable
        />
      )}

      {eventType === 'Blocked' && (
        <CreateUnavailable listingDate={listingDate} onComplete={onComplete} />
      )}
      {eventType === 'Reservation' && (
        <CreateReservation
          listingDate={listingDate}
          onComplete={onComplete}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
        />
      )}
    </Stack>
  )
}

export default CreateEvent
