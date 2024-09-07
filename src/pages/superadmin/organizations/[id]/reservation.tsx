import { type NextPage } from 'next'
import {
  Group,
  NumberInput,
  Space,
  Stack,
  TextInput,
  Text,
  Button,
} from '@mantine/core'
import { api } from 'utils/api'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import { useValidatedState } from '@mantine/hooks'
import { showNotification } from '@mantine/notifications'
import { useState, useEffect } from 'react'
import type { ReservationCreateManualAirbnb } from 'types/calendar'
import DateString from 'types/dateString'
import { validateEmail } from 'utils/vesta'
import CalendarEventDatePicker from 'components/calendar/CalendarEventDatePicker/CalendarEventDatePicker'
import SelectListing from 'components/listings/SelectListing/Single'
import { useRouter } from 'next/router'
import InternationalPhoneInput from 'components/common/InternationalPhoneInput/InternationalPhoneInput'
import { isValidPhoneNumber } from 'react-phone-number-input'

const AirbnbReservation: NextPage = () => {
  const router = useRouter()
  const organizationId = String(router.query.id)

  const organization = api.organizations.getOne.useQuery(
    {
      id: organizationId,
    },
    { enabled: organizationId !== 'undefined' }
  )

  const [listingId, setListingId] = useState<string | null>()
  const [dates, setDates] = useState<[DateString | null, DateString | null]>([
    null,
    null,
  ])

  const [adults, setAdults] = useState<number | ''>(1)
  const [children, setChildren] = useState<number | ''>(0)
  const [name, setName] = useState<string | undefined>(undefined)
  const [{ value: email, valid: emailValid }, setEmail] = useValidatedState(
    '',
    (value) => value === '' || validateEmail(value)
  )
  const [{ value: phone, valid: phoneValid }, setPhone] = useValidatedState(
    '',
    (value) => !value || isValidPhoneNumber(value)
  )
  const [confirmationCode, setConfirmationCode] = useState<string | undefined>(
    undefined
  )

  const { data: blockedData } = api.calendar.getBlockedDates.useQuery(
    {
      listingId: listingId || '',
    },
    { enabled: !!listingId }
  )

  const isValid =
    !!dates[1] &&
    typeof adults === 'number' &&
    adults > 0 &&
    !!name &&
    !!confirmationCode &&
    (!email || emailValid) &&
    (!phone || phoneValid)

  const [saveDisabled, setsaveDisabled] = useState<boolean>(false)

  const resetForm = () => {
    setListingId(null)
    setDates([null, null])
    setAdults(1)
    setChildren(0)
    setName('')
    setEmail('')
    setPhone('')
    setConfirmationCode('')
  }

  const submitReservation = () => {
    if (!listingId || !dates[0] || !dates[1] || !name || !adults) return

    setsaveDisabled(true)

    const reservation: ReservationCreateManualAirbnb = {
      listingId: listingId ?? '',
      channel: 'Airbnb',
      status: 'CONFIRMED',
      fromDate: dates[0],
      toDate: dates[1],
      name,
      email,
      phone,
      adults,
      children: children || 0,
      confirmationCode,
    }
    reservationMutation.mutate({
      ...reservation,
      fromDate: reservation.fromDate.toString(),
      toDate: reservation.toDate.toString(),
    })
  }
  const reservationMutation =
    api.calendar.createManualAirbnbReservation.useMutation()

  useEffect(() => {
    if (reservationMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Reservation created.',
        color: 'teal',
      })
      setsaveDisabled(false)
      resetForm()
    }
    if (reservationMutation.isError) {
      showNotification({
        title: '',
        message: 'An error occurred creating the reservation.',
        color: 'red',
      })
      setsaveDisabled(false)
    }
  }, [reservationMutation.isSuccess, reservationMutation.isError])

  const prices = blockedData?.prices.map((price) => ({
    date: DateString.fromString(price.date),
    price: price.price,
    minStay: price.minStay,
  }))

  return (
    <>
      <Breadcrumbs
        links={[
          { title: 'Super admin', href: '/superadmin/' },
          { title: 'Organizations', href: '/superadmin/organizations' },
          {
            title: organization?.data?.name ?? '',
            href: `/superadmin/organizations/${organizationId}`,
          },
          { title: 'Enter Airbnb reservation' },
        ]}
      />
      <Space h="xl" />
      <Group>
        <Stack>
          <Group>
            <SelectListing
              excludeIds={[]}
              selectedId={listingId}
              onSelect={setListingId}
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
          </Group>
          <Text>How many guests are going on this trip?</Text>
          <Group>
            <NumberInput
              label="Adults"
              min={1}
              withAsterisk
              pr={15}
              value={adults}
              onChange={(value) => setAdults(value)}
            />
            <NumberInput
              label="Children"
              min={0}
              withAsterisk
              value={children}
              onChange={(value) => setChildren(value)}
            />
          </Group>
          <Group>
            <TextInput
              label="Confirmation code from Airbnb"
              value={confirmationCode}
              withAsterisk
              onChange={(event) =>
                setConfirmationCode(event.currentTarget.value)
              }
            />
            <TextInput
              label="Name of the person responsible for this reservation."
              withAsterisk
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </Group>
          <Group>
            <TextInput
              label="Email"
              w={'50%'}
              pr={15}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <InternationalPhoneInput
              label="Phone"
              width="50%"
              value={phone}
              onChange={(value) => {
                setPhone(value)
              }}
              error={!phoneValid ? 'Invalid phone number' : undefined}
            />
          </Group>
          <Group position="right" mt="xl">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button
              disabled={!isValid || saveDisabled}
              onClick={submitReservation}
            >
              Create Reservation
            </Button>
          </Group>
        </Stack>
      </Group>
    </>
  )
}

export default AirbnbReservation
