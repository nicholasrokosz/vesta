/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Alert,
  Button,
  Divider,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { PaymentIntentResult } from '@stripe/stripe-js'
import { IconAlertCircle } from '@tabler/icons-react'
import InternationalPhoneInput from 'components/common/InternationalPhoneInput/InternationalPhoneInput'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { isValidPhoneNumber } from 'react-phone-number-input'
import type Stripe from 'stripe'
import type { ReservationDirectCreate } from 'types/calendar'
import DateString from 'types/dateString'
import { api } from 'utils/api'

interface Props {
  orgName?: string
  orgLogoUrl?: string | null
  paymentIntent?: Stripe.PaymentIntent
  validDates?: boolean
  feesData?: {
    id: string
    name: string
    value: number
    unit: string
    taxable: boolean
    type: string
    share: number
  }[]
  onLoading: (isLoading: boolean) => void
}

const SubmitReservation = ({
  orgName,
  orgLogoUrl,
  paymentIntent,
  feesData,
  onLoading,
  validDates = true,
}: Props) => {
  const router = useRouter()

  const stripe = useStripe()
  const elements = useElements()

  const { key, start, end, adults, children, pets } = router.query

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(!validDates)

  const startDate = DateString.fromString(start as string)
  const endDate = DateString.fromString(end as string)

  const EMAIL_REGEX = /^\S+@\S+$/

  const validateEmail = (val: string) => {
    if (val === '') return 'Email is required'
    if (!EMAIL_REGEX.test(val)) return 'Invalid email'
    return null
  }

  const form = useForm({
    initialValues: {
      first: '',
      last: '',
      phone: '',
      email: '',
    },
    validate: {
      first: (val) => (val === '' ? 'First name is required' : null),
      last: (val) => (val === '' ? 'Last name is required' : null),
      email: (val) => validateEmail(val),
      phone: (val) => {
        if (val === '') return 'Phone is required'
        if (val) return !isValidPhoneNumber(val) ? 'Invalid phone' : null
      },
    },
  })

  const showErrorNotification = (message?: string) => {
    showNotification({
      title: 'Error',
      message:
        message ||
        'There was an error initializing our payments processor. Please try again.',
      color: 'red',
    })
  }

  const reservationMutation = api.direct.createReservationByKey.useMutation()

  const submitPayment = () => {
    form.validate()
    if (!form.isValid()) {
      return
    }
    setButtonDisabled(true)

    const cardElement = elements?.getElement(PaymentElement)
    if (
      !stripe ||
      !elements ||
      !paymentIntent ||
      !paymentIntent.client_secret ||
      !cardElement
    ) {
      showErrorNotification()
      setButtonDisabled(false)
      return
    }

    onLoading(true)
    stripe
      .confirmPayment({
        elements: elements,
        confirmParams: {
          receipt_email: form.values.email,
        },
        redirect: 'if_required',
      })
      .then((result: PaymentIntentResult) => {
        if (result.error) {
          showErrorNotification(result.error.message)
          setButtonDisabled(false)
          onLoading(false)
        } else {
          createReservation()
        }
      })
      .catch((e) => {
        setButtonDisabled(false)
        const error = e as Error
        showNotification({
          title: 'Error',
          message: error.message,
          color: 'red',
        })
        setButtonDisabled(false)
        onLoading(false)
        return
      })

    const createReservation = () => {
      const reservation: ReservationDirectCreate = {
        listingKey: key as string,
        channel: 'Direct',
        status: 'RESERVED',
        fromDate: startDate,
        toDate: endDate,
        name: `${form.values.first} ${form.values.last}`,
        email: form.values.email,
        phone: form.values.phone,
        adults: +adults!,
        children: +children!,
        pets: +pets!,
        fees: feesData?.map((fee) => ({
          name: fee.name,
          value: fee.value,
          unit: fee.unit,
          taxable: fee.taxable,
          pmcShare: fee.share,
        })),
      }

      reservationMutation.mutate(
        {
          key: key as string,
          reservation: {
            ...reservation,
            fromDate: reservation.fromDate.toString(),
            toDate: reservation.toDate.toString(),
          },
        },
        {
          onSuccess: (calendarEvent) => {
            void router.push({
              pathname: `/direct/success`,
              query: { id: calendarEvent?.id, key: key as string },
            })
          },
          onError: () => {
            setButtonDisabled(false)
            onLoading(false)
            showNotification({
              title: 'Error',
              message: 'Something went wrong. Please try again later.',
              color: 'red',
            })
          },
        }
      )
    }
  }

  return (
    <>
      <Stack miw={500}>
        {orgLogoUrl && (
          <Image
            maw={100}
            src={orgLogoUrl || ''}
            alt={`${orgName || 'Company'} logo`}
          />
        )}
        <Text fz="lg" fw={600}>
          Reservation details
        </Text>
        {!validDates && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Error"
            color="red"
          >
            Sorry, but those dates are unavailable
          </Alert>
        )}
        <Stack spacing={4}>
          <Text fw={600}>Dates</Text>
          <Text>{`${DateTime.fromISO(startDate.toString()).toFormat(
            'MMM d'
          )} - ${DateTime.fromISO(endDate.toString()).toFormat(
            'MMM d, yyyy'
          )}`}</Text>
        </Stack>
        <Group>
          <Stack spacing={4}>
            <Text fw={600}>Adults</Text>
            <Text>{adults}</Text>
          </Stack>
          <Stack spacing={4}>
            <Text fw={600}>Children</Text>
            <Text>{children}</Text>
          </Stack>
          {+pets! > 0 && (
            <Stack spacing={4}>
              <Text fw={600}>Pet(s)</Text>
              <Text>{pets}</Text>
            </Stack>
          )}
        </Group>
        <Divider my="sm" />
        <Text fz="lg" fw={600}>
          Guest details
        </Text>
        <SimpleGrid cols={2}>
          <TextInput
            label="First name"
            withAsterisk
            required
            {...form.getInputProps('first')}
          />
          <TextInput
            label="Last name"
            withAsterisk
            required
            {...form.getInputProps('last')}
          />

          <InternationalPhoneInput
            label="Phone"
            value={form.values.phone}
            required
            onChange={(value) => {
              form.setFieldValue('phone', value)
            }}
            error={form.errors.phone}
          />
          <TextInput
            label="Email address"
            withAsterisk
            required
            type="email"
            {...form.getInputProps('email')}
          />
        </SimpleGrid>

        <PaymentElement />

        <Button
          disabled={buttonDisabled}
          w="100%"
          color="gray.9"
          size="md"
          onClick={() => submitPayment()}
        >
          Pay now
        </Button>
      </Stack>
    </>
  )
}

export default SubmitReservation
