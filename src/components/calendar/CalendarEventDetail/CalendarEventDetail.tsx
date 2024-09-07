import { useState, useEffect } from 'react'
import {
  createStyles,
  Divider,
  Image,
  Flex,
  Stack,
  Select,
  Title,
  Radio,
  Text,
  Textarea,
  Button,
} from '@mantine/core'
import type { ICalendarEvent, RequestToBookResponse } from 'types/calendar'
import { formatDateRange, formatTimeWithZone } from 'utils/dateFormats'
import { RequestToBookDeclineReasonType } from 'server/integrations/bookingpal/types'
import { api } from 'utils/api'
import { showNotification } from '@mantine/notifications'
import { Channel } from '@prisma/client'
import { addLineBreaks } from 'utils/text'
import ReservationLinks from '../ReservationLinks/ReservationLinks'

const useStyles = createStyles(() => ({
  image: {
    paddingBottom: '12px',
  },
  title: {
    fontWeight: 700,
    fontSize: '18px',
  },
  guest: {
    fontWeight: 700,
    fontSize: '16px',
  },
  guestDetail: {
    fontWeight: 600,
    fontSize: '12px',
  },
  checkin: {
    paddingTop: '12px',
  },
  bold: {
    fontWeight: 600,
  },
}))

interface Props {
  event: ICalendarEvent
  onComplete: () => void
  disableEdits?: boolean
}

const CalendarEventDetail = ({ event, onComplete, disableEdits }: Props) => {
  const { classes } = useStyles()
  const requestToBookMutation =
    api.calendar.respondToRequestToBook.useMutation()

  const deleteEventMutation = api.calendar.deleteEvent.useMutation()
  const cancelReservationMutation = api.calendar.cancelReservation.useMutation()

  const [approve, setApprove] = useState<string | undefined>('approve')
  const [denyReason, setDenyReason] = useState<RequestToBookDeclineReasonType>()
  const [denyMessage, setDenyMessage] = useState<string>()
  const submitForm = () => {
    if (!event.reservation) return

    const requestToBookResponse: RequestToBookResponse = {
      approve: approve === 'approve',
      reservationId: event.reservation?.id,
      denyReason,
      denyMessage,
    }

    requestToBookMutation.mutate(requestToBookResponse)
  }

  useEffect(() => {
    if (deleteEventMutation.isError) {
      showNotification({
        title: '',
        message: 'An error occurred, please try again later.',
        color: 'red',
      })
    }
  }, [deleteEventMutation.isError])

  useEffect(() => {
    if (deleteEventMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Event deleted.',
        color: 'teal',
      })
      onComplete()
    }
  }, [deleteEventMutation.isSuccess])

  useEffect(() => {
    if (cancelReservationMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Reservation cancelled.',
        color: 'teal',
      })
      onComplete()
    }
  }, [cancelReservationMutation.isSuccess])

  useEffect(() => {
    if (requestToBookMutation.isError) {
      showNotification({
        title: '',
        message: 'An error occurred, please try again later.',
        color: 'red',
      })
    }
  }, [requestToBookMutation.isError])

  useEffect(() => {
    if (requestToBookMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Response sent.',
        color: 'teal',
      })
      onComplete()
    }
  }, [requestToBookMutation.isSuccess])

  return (
    <Flex direction={'column'}>
      <Image
        className={classes.image}
        src={event.listingPhoto}
        alt={event.listingName}
        radius={'sm'}
      />
      <div className={classes.title}>{event.listingName}</div>
      {event.listingAddress && (
        <div>
          {event.listingUnitType} • {event.listingAddress}
        </div>
      )}

      {event.reservation && (
        <>
          <Flex
            className={classes.checkin}
            direction={'row'}
            justify={'space-between'}
          >
            <div>
              <div className={classes.bold}>Check-in</div>
              <div>
                {formatTimeWithZone(event.fromDate, event.listingTimeZone)}
              </div>
            </div>
            <div>
              <div className={classes.bold}>Checkout</div>
              <div>
                {formatTimeWithZone(event.toDate, event.listingTimeZone)}
              </div>
            </div>
          </Flex>
          <Divider my="sm" />
        </>
      )}

      {!event.reservation && (
        <Flex direction={'row'} justify={'space-between'}>
          <div>{formatDateRange(event)}</div>
        </Flex>
      )}

      {!event.reservation && (
        <>
          {!!event.notes && (
            <>
              <Divider my="sm" />
              <Text>{addLineBreaks(event.notes)}</Text>
            </>
          )}
          {!disableEdits && (
            <Button
              onClick={() => deleteEventMutation.mutate(event.id)}
              mt={30}
            >
              Delete block
            </Button>
          )}
        </>
      )}

      {event.reservation && (
        <Stack>
          <Flex direction={'column'} align={'center'}>
            <div className={classes.guest}>{event.reservation.name}</div>
            <div className={classes.guestDetail}>
              {event.reservation.guests} • {event.reservation.nights}
            </div>
          </Flex>
          <Flex direction={'row'} justify={'space-between'}>
            <div>{'Period'}</div>
            <div>{formatDateRange(event)}</div>
          </Flex>
          <Flex direction={'row'} justify={'space-between'}>
            <div>{'Channel'}</div>
            <div>{event.reservation.channel}</div>
          </Flex>

          {event.reservation.channel === Channel.Direct && !disableEdits && (
            <>
              <Button
                onClick={() => {
                  if (!event.reservation) return
                  if (
                    window.confirm(
                      'Are you sure you want to delete this reservation?'
                    )
                  ) {
                    cancelReservationMutation.mutate({
                      id: event.reservation.id,
                    })
                  }
                }}
              >
                Cancel Reservation
              </Button>
            </>
          )}

          {event.reservation.status === 'PROVISIONAL' && !disableEdits && (
            // Form for responding to a reservation request
            <form>
              <Title order={3}>Request to book</Title>
              <Radio.Group value={approve} onChange={setApprove}>
                <Flex pt={5} pb={5} gap="md">
                  <Radio
                    variant="horizontal"
                    label="Approve"
                    color="vesta"
                    value="approve"
                    mb={16}
                  />
                  <Radio label="Deny" color="vesta" value="deny" />
                </Flex>
              </Radio.Group>

              {approve === 'deny' && (
                <>
                  <Select
                    label="Choose a reason for denying this request"
                    placeholder="Pick one"
                    value={denyReason}
                    onChange={(value) =>
                      setDenyReason(value as RequestToBookDeclineReasonType)
                    }
                    data={[
                      {
                        label: 'Dates not available',
                        value: RequestToBookDeclineReasonType.NotAvailable,
                      },
                      {
                        label: 'Not a good fit',
                        value: RequestToBookDeclineReasonType.NotAGoodFit,
                      },
                      {
                        label: 'Waiting for a better reservation',
                        value: RequestToBookDeclineReasonType.Waiting,
                      },
                      {
                        label: 'Not comfortable',
                        value: RequestToBookDeclineReasonType.NotComfortable,
                      },
                    ]}
                    withAsterisk
                  />
                  <Textarea
                    label="Message to the guest"
                    w={'100%'}
                    autosize
                    minRows={2}
                    value={denyMessage}
                    onChange={(e) => setDenyMessage(e.currentTarget.value)}
                    pb={10}
                  />
                </>
              )}
              <Button onClick={submitForm}>Send response</Button>
            </form>
          )}
          <ReservationLinks
            messageThreadId={event.reservation.messageThreadId}
            reservationId={event.reservation.id}
            disableFinancials={!event.reservation.hasRevenue}
          />
        </Stack>
      )}
    </Flex>
  )
}

export default CalendarEventDetail
