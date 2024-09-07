import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  Stack,
  Button,
  TextInput,
  NumberInput,
  Text,
  Flex,
  Checkbox,
  Stepper,
  Group,
  Space,
  Title,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { isValidPhoneNumber } from 'react-phone-number-input'

import { api } from 'utils/api'
import type { ReservationCreateManualDirect } from 'types/calendar'
import { validateEmail } from 'utils/vesta'
import SelectListing from 'components/listings/SelectListing/Single'
import DateString from 'types/dateString'
import ManualRevenueEstimator from 'components/revenue/RevenueEstimator/ManualRevenueEstimator'
import type { RevenueFeeCreate } from 'types/revenue'
import { useValidatedState } from '@mantine/hooks'
import { IconCurrencyDollar, IconPercentage } from '@tabler/icons-react'
import CalendarEventDatePicker from '../CalendarEventDatePicker/CalendarEventDatePicker'
import InternationalPhoneInput from 'components/common/InternationalPhoneInput/InternationalPhoneInput'

const FeeCheckbox = ({
  fee,
}: {
  fee: {
    id: string
    name: string
    unit: string
    value: number
    applicable: boolean
  }
}) => {
  const getLabel = () =>
    `${fee.name}: $${fee.value} ${fee.unit
      .split(/(?=[A-Z])/)
      .map((str: string) => str.toLowerCase())
      .join(' ')}`

  return <Checkbox value={fee.id} mt="xs" label={<Text>{getLabel()}</Text>} />
}

interface Props {
  listingDate: [listingId: string, date: DateString | undefined] | undefined
  onComplete: () => void
  activeStep: number
  setActiveStep: Dispatch<SetStateAction<number>>
}

const CreateReservation = ({
  listingDate,
  onComplete,
  activeStep,
  setActiveStep,
}: Props) => {
  const [listingId, setListingId] = useState<string | null>(
    listingDate?.[0] ?? null
  )
  const [dates, setDates] = useState<[DateString | null, DateString | null]>([
    listingDate?.[1] ?? null,
    null,
  ])

  const [confirmed, setConfirmed] = useState<boolean>(true)
  const [adults, setAdults] = useState<number>(1)
  const [children, setChildren] = useState<number>(0)
  const [name, setName] = useState<string | undefined>(undefined)
  const [{ value: email, valid: emailValid }, setEmail] = useValidatedState(
    '',
    (value) => value === '' || validateEmail(value)
  )
  const [{ value: phone, valid: phoneValid }, setPhone] = useValidatedState(
    '',
    (value) => !value || isValidPhoneNumber(value)
  )
  const isValid =
    !!dates[1] &&
    adults > 0 &&
    !!name &&
    (!email || emailValid) &&
    (!phone || phoneValid)

  const { data: blockedData } = api.calendar.getBlockedDates.useQuery(
    {
      listingId: listingId || '',
    },
    { enabled: !!listingId }
  )

  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const [fees, setFees] = useState<RevenueFeeCreate[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [accommodationRevenue, setAccommodationRevenue] = useState<number>(0)
  const [showDiscount, setShowDiscount] = useState<boolean>(false)
  const [saveDisabled, setsaveDisabled] = useState<boolean>(false)

  const nextStep = () =>
    setActiveStep((current) => (current < 2 ? current + 1 : current))
  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current))

  const submitReservation = () => {
    if (!listingId || !dates[0] || !dates[1] || !name || !adults) return

    setsaveDisabled(true)

    const reservation: ReservationCreateManualDirect = {
      listingId: listingId ?? '',
      channel: 'Direct',
      status: confirmed ? 'CONFIRMED' : 'RESERVED',
      fromDate: dates[0],
      toDate: dates[1],
      name,
      email,
      phone,
      adults,
      children: children || 0,
      fees,
      discount,
    }
    createDirectBookingMutation.mutate({
      ...reservation,
      fromDate: reservation.fromDate.toString(),
      toDate: reservation.toDate.toString(),
    })
  }
  const createDirectBookingMutation =
    api.calendar.createManualDirectReservation.useMutation()

  useEffect(() => {
    if (createDirectBookingMutation.isSuccess) {
      showNotification({
        title: '',
        message: 'Reservation created.',
        color: 'teal',
      })
      setsaveDisabled(false)
      onComplete()
    }
    if (createDirectBookingMutation.isError) {
      showNotification({
        title: '',
        message:
          'An error occurred creating the reservation, please try again later.',
        color: 'red',
      })
      setsaveDisabled(false)
    }
  }, [
    createDirectBookingMutation.isSuccess,
    createDirectBookingMutation.isError,
  ])

  const { data: feesData } = api.revenue.getFeesForDirectBooking.useQuery(
    {
      listingId: listingId || '',
      guests: adults + children,
      pets: false,
    },
    { enabled: !!listingId && !!dates[0] && !!dates[1] }
  )

  useEffect(() => {
    if (!feesData) return

    const applicableFeeIds = feesData
      .filter((fee) => fee.applicable)
      .map((fee) => fee.id)

    setSelectedFees(applicableFeeIds)
  }, [feesData])

  const handleDiscountChange = (
    val: number,
    target: 'percentage' | 'dollar'
  ) => {
    if (target === 'percentage') {
      setDiscountPercent(val)
      setDiscountAmount(accommodationRevenue * (val / 100))
    } else {
      setDiscountPercent((val / accommodationRevenue) * 100)
      setDiscountAmount(val)
    }
  }

  const prices = blockedData?.prices.map((price) => ({
    date: DateString.fromString(price.date),
    price: price.price,
    minStay: price.minStay,
  }))

  return (
    <>
      <Stepper
        active={activeStep}
        onStepClick={setActiveStep}
        size="xs"
        breakpoint="xs"
        allowNextStepsSelect={false}
        mt="md"
        styles={{ steps: { maxWidth: '50%', margin: '0 auto' } }}
      >
        <Stepper.Step label="Reservation">
          <Space h="md" />
          <Stack>
            <Flex align="center" gap="xl">
              <SelectListing
                excludeIds={[]}
                selectedId={listingId}
                onSelect={setListingId}
                disabled={!!listingDate?.[0]}
              />
              <Checkbox
                checked={confirmed}
                onChange={(event) => setConfirmed(event.currentTarget.checked)}
                label="Confirmed"
              />
            </Flex>

            <CalendarEventDatePicker
              blockedStartDates={blockedData?.blockedCheckIn}
              blockedEndDates={blockedData?.blockedCheckOut}
              prices={prices}
              disabled={!listingId}
              onSetDates={setDates}
              startDate={dates?.[0]}
              disableMinDate={true}
              disableMinStay={false}
            />

            <Stack>
              <div>
                <Text>How many guests are going on this trip?</Text>
                <Flex>
                  <NumberInput
                    label="Adults"
                    min={1}
                    withAsterisk
                    pr={15}
                    value={adults}
                    required
                    onChange={(value) => setAdults(value || 1)}
                  />
                  <NumberInput
                    label="Children"
                    min={0}
                    withAsterisk
                    value={children}
                    onChange={(value) => setChildren(value || 0)}
                  />
                </Flex>
              </div>
              <div>
                <TextInput
                  label="Name of the person responsible for this reservation."
                  withAsterisk
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <Flex>
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
                </Flex>
              </div>
            </Stack>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Fees">
          <Stack>
            {feesData && (
              <Checkbox.Group
                label="Applied fees"
                value={selectedFees}
                onChange={setSelectedFees}
              >
                {feesData.map((fee) => (
                  <FeeCheckbox fee={fee} key={fee.id} />
                ))}
              </Checkbox.Group>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Estimate">
          <Stack>
            {listingId && dates[0] && dates[1] && (
              <ManualRevenueEstimator
                listingId={listingId}
                dates={[dates[0], dates[1]]}
                feeIds={selectedFees}
                guests={adults + children}
                feesCalculated={setFees}
                accommodationRevenueCalculated={setAccommodationRevenue}
                discount={discount}
              />
            )}
          </Stack>
          {!showDiscount && !discount && (
            <Button variant="subtle" onClick={() => setShowDiscount(true)}>
              + Add Discount
            </Button>
          )}

          {showDiscount && (
            <Stack>
              <Space h="sm" />
              <Title order={1}>Discount on accommodation revenue</Title>
              <Group>
                <NumberInput
                  rightSection={<IconPercentage size={16} />}
                  value={discountPercent}
                  onChange={(value) => {
                    handleDiscountChange(+value, 'percentage')
                  }}
                />
                <Text>or</Text>
                <NumberInput
                  rightSection={<IconCurrencyDollar size={16} />}
                  value={discountAmount}
                  precision={2}
                  onChange={(value) => {
                    handleDiscountChange(+value, 'dollar')
                  }}
                />
                <Button
                  variant="outline"
                  disabled={discountAmount === 0 || discountPercent === 0}
                  onClick={() => setDiscount(discountPercent)}
                >
                  Apply discount
                </Button>
                <Button
                  variant="subtle"
                  onClick={() => {
                    setDiscount(0)
                    setDiscountAmount(0)
                    setDiscountPercent(0)
                    setShowDiscount(false)
                  }}
                >
                  Remove
                </Button>
              </Group>
            </Stack>
          )}
        </Stepper.Step>
      </Stepper>
      <Group position="right" mt="xl">
        {activeStep !== 0 && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}

        {activeStep === 0 && (
          <Button onClick={nextStep} disabled={!isValid}>
            Next step
          </Button>
        )}
        {activeStep === 1 && <Button onClick={nextStep}>Next step</Button>}
        {activeStep === 2 && (
          <Button disabled={saveDisabled} onClick={submitReservation}>
            Create Reservation
          </Button>
        )}
      </Group>
    </>
  )
}

export default CreateReservation
