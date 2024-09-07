import { Card, Flex, Image, Stack, Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'

import { Elements } from '@stripe/react-stripe-js'
import type {
  Stripe,
  StripeElementsOptionsClientSecret,
} from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import DirectRevenueEstimator from 'components/revenue/RevenueEstimator/DirectRevenueEstimator'
import SubmitReservation from 'components/direct/SubmitReservation'
import { useRouter } from 'next/router'
import { useState } from 'react'
import type { PaymentIntentPayload } from 'server/api/routers/direct'
import { api } from 'utils/api'
import DateString from 'types/dateString'

const DirectPage = () => {
  const router = useRouter()

  const { key, start, end, adults, children, pets } = router.query
  const numGuests = parseInt(adults as string) + parseInt(children as string)
  const numPets = parseInt(pets as string)

  const { data: listingInfo } = api.direct.getListingByKey.useQuery(
    { key: key as string },
    { enabled: !!key }
  )
  const { data: availabilityData } = api.direct.getBlockedDatesByKey.useQuery(
    { key: key as string },
    { enabled: !!key }
  )
  const { data: feesData } = api.direct.getFeesForDirectBookingByKey.useQuery(
    {
      key: key as string,
      startDate: start as string,
      endDate: end as string,
      guests: numGuests,
      pets: numPets > 0,
    },
    { enabled: !!key }
  )

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [paymentIntentPayload, setPaymentIntentPayload] = useState<
    PaymentIntentPayload | undefined
  >(undefined)
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null)
  const [stripeOptions, setStripeOptions] = useState<
    StripeElementsOptionsClientSecret | undefined
  >(undefined)

  const paymentMutation = api.direct.createPaymentIntent.useMutation()

  const createPaymentIntent = (totalAmount: number) => {
    paymentMutation.mutate(
      {
        key: key as string,
        amount: totalAmount,
      },
      {
        onSuccess: (paymentIntentPayload) => {
          setPaymentIntentPayload(paymentIntentPayload)
          const s = loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
            {
              stripeAccount: paymentIntentPayload.stripeAccountId,
            }
          )

          setStripePromise(s)
          setStripeOptions({
            clientSecret:
              paymentIntentPayload.paymentIntent.client_secret || '',
          })
          setIsLoading(false)
        },
        onError: () => {
          setStripeOptions(undefined)
          setIsLoading(false)
          showNotification({
            title: 'Error',
            message:
              'Sorry, but there was an error setting up payment processing. Please try again.',
            color: 'red',
          })
        },
      }
    )
  }

  const today = new Date().toISOString().substring(0, 10)
  const firstBlockedDateAfterCheckIn = availabilityData?.blockedCheckOut.find(
    (dateStr) => new Date(dateStr) > new Date(start as string)
  ) as string

  const validDates =
    availabilityData &&
    !availabilityData.blockedCheckIn.includes(start as string) && // check-in must not be blocked
    !availabilityData.blockedCheckOut.includes(end as string) && // checkout must not be blocked
    new Date(start as string) >= new Date(today) && // check-in must not be before today
    (!firstBlockedDateAfterCheckIn
      ? true
      : new Date(firstBlockedDateAfterCheckIn) > new Date(end as string)) // checkout must not be after first blocked date after check-in

  return (
    <Flex p={32} gap={56}>
      <VestaSpinnerOverlay visible={isLoading} />
      {!!paymentIntentPayload && !!stripePromise && !!stripeOptions && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <SubmitReservation
            orgName={paymentIntentPayload.organizationName}
            orgLogoUrl={paymentIntentPayload.organizationLogoUrl}
            paymentIntent={paymentIntentPayload.paymentIntent}
            feesData={feesData}
            onLoading={(isLoading) => setIsLoading(isLoading)}
            validDates={validDates}
          />
        </Elements>
      )}
      <Card
        w={450}
        h="min-content"
        padding="xl"
        radius="lg"
        shadow="xs"
        withBorder
        sx={{ overflow: 'visible', position: 'relative' }}
      >
        {feesData && listingInfo ? (
          <>
            <Flex mb="sm" gap="md">
              <Image
                maw={100}
                radius="md"
                src={listingInfo.content?.photos[0]}
                alt="Primary property photo"
              />
              <Stack>
                <Text fw={600}>{listingInfo.name}</Text>
                <Flex gap="md">
                  <Text>{listingInfo.guests} guests</Text>
                  <Text>
                    {listingInfo.beds} {listingInfo.beds === 1 ? 'bed' : 'beds'}
                  </Text>
                  <Text>{listingInfo.baths} baths</Text>
                </Flex>
              </Stack>
            </Flex>
            <DirectRevenueEstimator
              listingKey={key as string}
              dates={[
                DateString.fromString(start as string),
                DateString.fromString(end as string),
              ]}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              guests={numGuests}
              fees={
                feesData?.map((fee) => {
                  return {
                    name: fee.name,
                    value: fee.value,
                    unit: fee.unit,
                    taxable: fee.taxable,
                    pmcShare: fee.share,
                  }
                }) || []
              }
              totalAmountCalculated={(totalAmount) =>
                createPaymentIntent(totalAmount)
              }
            />
          </>
        ) : (
          <VestaSpinnerOverlay visible={true} />
        )}
      </Card>
    </Flex>
  )
}
export default DirectPage
