import { useEffect, useState } from 'react'
import { Button, Text, Stack, createStyles, Accordion } from '@mantine/core'
import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'
import { api } from 'utils/api'
import { IconPlus } from '@tabler/icons-react'
import { DynamicPricing } from '@prisma/client'

interface Props {
  onSuccess: () => void
  listingId: string
}

const useStyles = createStyles(() => ({
  sectionToggle: {
    paddingTop: 25,
    paddingBottom: 10,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  error: { fontWeight: 600, color: 'red' },
  success: { fontWeight: 600, color: 'green' },
  section: { paddingBottom: 20 },
}))

const Review = ({ listingId }: Props) => {
  const { classes } = useStyles()

  const listing = api.listing.getReview.useQuery(
    {
      id: listingId,
    },
    { enabled: listingId !== 'undefined' }
  )

  const publishMutation = api.listing.publishPropertyInBookingPal.useMutation()
  const [publishMessage, setPublishMessage] = useState<string | null>(null)
  useEffect(() => {
    if (publishMutation.isSuccess) {
      void listing.refetch()
      setPublishMessage('Listing published')
    }
  }, [publishMutation.isSuccess])
  useEffect(() => {
    if (publishMutation.isError) {
      setPublishMessage(publishMutation.error?.message)
    }
  }, [publishMutation.isError])

  const photosMutation = api.listing.publishPhotos.useMutation()
  const [photosMessage, setPhotosMessage] = useState<string | null>(null)
  useEffect(() => {
    console.log('photosMutation', photosMutation)
    if (photosMutation.isSuccess) {
      setPhotosMessage('Photos published')
    }
  }, [photosMutation.isSuccess])
  useEffect(() => {
    console.log('photosMutation2', photosMutation)
    if (photosMutation.isError) {
      setPhotosMessage(photosMutation.error?.message)
    }
  }, [photosMutation.isError])

  const pricingMutation = api.listing.publishPricing.useMutation()
  const [pricingMessage, setPricingMessage] = useState<string | null>(null)
  useEffect(() => {
    if (pricingMutation.isSuccess) {
      setPricingMessage('Pricing published')
    }
  }, [pricingMutation.isSuccess])
  useEffect(() => {
    if (pricingMutation.isError) {
      setPricingMessage(pricingMutation.error?.message)
    }
  }, [pricingMutation.isError])

  const lengthOfStayDiscountsMutation =
    api.listing.publishLengthOfStayDiscounts.useMutation()
  const [discountMessage, setDiscountMessage] = useState<string | null>(null)
  useEffect(() => {
    if (lengthOfStayDiscountsMutation.isSuccess) {
      setDiscountMessage('Length of stay discounts published')
    }
  }, [lengthOfStayDiscountsMutation.isSuccess])
  useEffect(() => {
    if (lengthOfStayDiscountsMutation.isError) {
      setDiscountMessage(lengthOfStayDiscountsMutation.error?.message)
    }
  }, [lengthOfStayDiscountsMutation.isError])

  const feesAndTaxesMutation = api.listing.publishFeesAndTaxes.useMutation()
  const [feesAndTaxesMessage, setFeesAndTaxesMessage] = useState<string | null>(
    null
  )
  useEffect(() => {
    if (feesAndTaxesMutation.isSuccess) {
      setFeesAndTaxesMessage('Fees and taxes published')
    }
  }, [feesAndTaxesMutation.isSuccess])
  useEffect(() => {
    if (feesAndTaxesMutation.isError) {
      setFeesAndTaxesMessage(feesAndTaxesMutation.error?.message)
    }
  }, [feesAndTaxesMutation.isError])

  const availabilityMutation = api.listing.publishAvailability.useMutation()
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null
  )
  useEffect(() => {
    if (availabilityMutation.isSuccess) {
      setAvailabilityMessage('Availability published')
    }
  }, [availabilityMutation.isSuccess])
  useEffect(() => {
    if (availabilityMutation.isError) {
      setAvailabilityMessage(availabilityMutation.error?.message)
    }
  }, [availabilityMutation.isError])

  const validateMutation = api.listing.validate.useMutation()
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  )
  useEffect(() => {
    if (validateMutation.isSuccess) {
      setValidationMessage('Validation sent')
    }
  }, [validateMutation.isSuccess])
  useEffect(() => {
    if (validateMutation.isError) {
      setValidationMessage(validateMutation.error?.message)
    }
  }, [validateMutation.isError])

  const activateMutation = api.listing.activate.useMutation()
  const [activationMessage, setActivationMessage] = useState<string | null>(
    null
  )
  useEffect(() => {
    if (activateMutation.isSuccess) {
      setActivationMessage('Activation sent')
    }
  }, [activateMutation.isSuccess])
  useEffect(() => {
    if (activateMutation.isError) {
      setActivationMessage(activateMutation.error?.message)
    }
  }, [activateMutation.isError])

  const publishToPriceLabsMutation =
    api.listing.publishToPriceLabs.useMutation()
  const [publishToPriceLabsMesage, setPublishToPriceLabsMessage] = useState<
    string | null
  >(null)
  useEffect(() => {
    if (publishToPriceLabsMutation.isSuccess) {
      setPublishToPriceLabsMessage('Listing pushed to PriceLabs')
    }
  }, [publishToPriceLabsMutation.isSuccess])
  useEffect(() => {
    if (publishToPriceLabsMutation.isError) {
      setPublishToPriceLabsMessage(publishToPriceLabsMutation.error?.message)
    }
  }, [publishToPriceLabsMutation.isError])

  const syncPriceLabsCalendarMutation =
    api.listing.syncPriceLabsCalendar.useMutation()
  const [syncPriceLabsCalendarMessage, setSyncPriceLabsCalendarMessage] =
    useState<string | null>(null)
  useEffect(() => {
    if (syncPriceLabsCalendarMutation.isSuccess) {
      setSyncPriceLabsCalendarMessage('PriceLabs calendar sync queued')
    }
  }, [syncPriceLabsCalendarMutation.isSuccess])
  useEffect(() => {
    if (syncPriceLabsCalendarMutation.isError) {
      setSyncPriceLabsCalendarMessage(
        syncPriceLabsCalendarMutation.error?.message
      )
    }
  }, [syncPriceLabsCalendarMutation.isError])

  const syncPriceLabsReservationsMutation =
    api.listing.syncPriceLabsReservations.useMutation()
  const [
    syncPriceLabsReservationsMessage,
    setSyncPriceLabsReservationsMessage,
  ] = useState<string | null>(null)
  useEffect(() => {
    if (syncPriceLabsReservationsMutation.isSuccess) {
      setSyncPriceLabsReservationsMessage('PriceLabs reservations sync queued')
    }
  }, [syncPriceLabsReservationsMutation.isSuccess])
  useEffect(() => {
    if (syncPriceLabsReservationsMutation.isError) {
      setSyncPriceLabsReservationsMessage(
        syncPriceLabsReservationsMutation.error?.message
      )
    }
  }, [syncPriceLabsReservationsMutation.isError])

  return (
    <>
      <VestaSpinnerOverlay
        visible={listing.isLoading || publishMutation.isLoading}
      />
      <Stack w={250}>
        <Stack className={classes.section}>
          {listing.data?.bpProductId ? (
            <Text>BookingPal productID: {listing.data?.bpProductId}</Text>
          ) : (
            <Text>Listing not yet published in BookingPal</Text>
          )}

          <Text
            className={
              publishMutation.isSuccess ? classes.success : classes.error
            }
          >
            {publishMessage}
          </Text>
          <Button
            onClick={() => {
              publishMutation.mutate({ id: listingId })
            }}
          >
            {listing.data?.bpProductId && 'Update full listing'}
            {!listing.data?.bpProductId && 'Publish full listing'}
          </Button>
        </Stack>

        {listing.data?.bpProductId && (
          <Accordion
            variant="contained"
            miw="350px"
            chevron={<IconPlus size="1rem" />}
            styles={{
              chevron: {
                '&[data-rotate]': {
                  transform: 'rotate(45deg)',
                },
              },
            }}
          >
            <Accordion.Item value="individual-calls">
              <Accordion.Control>Individual calls</Accordion.Control>
              <Accordion.Panel>
                <Stack className={classes.section}>
                  <Text
                    className={
                      photosMutation.isSuccess ? classes.success : classes.error
                    }
                  >
                    {photosMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      photosMutation.mutate({ id: listingId })
                    }}
                  >
                    Publish photos
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      pricingMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {pricingMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      pricingMutation.mutate({ id: listingId })
                    }}
                  >
                    Publish pricing
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      lengthOfStayDiscountsMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {discountMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      lengthOfStayDiscountsMutation.mutate({ id: listingId })
                    }}
                  >
                    Publish length of stay discount
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      feesAndTaxesMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {feesAndTaxesMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      feesAndTaxesMutation.mutate({ id: listingId })
                    }}
                  >
                    Publish fees and taxes
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      availabilityMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {availabilityMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      availabilityMutation.mutate({ id: listingId })
                    }}
                  >
                    Publish availability
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      validateMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {validationMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      validateMutation.mutate({ id: listingId })
                    }}
                  >
                    Validate listing
                  </Button>
                </Stack>

                <Stack className={classes.section}>
                  <Text
                    className={
                      activateMutation.isSuccess
                        ? classes.success
                        : classes.error
                    }
                  >
                    {activationMessage}
                  </Text>
                  <Button
                    onClick={() => {
                      activateMutation.mutate({ id: listingId })
                    }}
                  >
                    Activate listing
                  </Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}
      </Stack>

      {listing.data?.pricing?.dynamicPricing === DynamicPricing.PriceLabs && (
        <>
          <Stack w={250}>
            <Text
              className={
                publishToPriceLabsMutation.isSuccess
                  ? classes.success
                  : classes.error
              }
            >
              {publishToPriceLabsMesage}
            </Text>
            <Button
              onClick={() => {
                publishToPriceLabsMutation.mutate({ id: listingId })
              }}
            >
              Publish to PriceLabs
            </Button>
          </Stack>
          <Stack w={250}>
            <Text
              className={
                syncPriceLabsCalendarMutation.isSuccess
                  ? classes.success
                  : classes.error
              }
            >
              {syncPriceLabsCalendarMessage}
            </Text>
            <Button
              onClick={() => {
                syncPriceLabsCalendarMutation.mutate({ id: listingId })
              }}
            >
              Sync calendar pricing to PriceLabs
            </Button>
          </Stack>

          <Stack w={250}>
            <Text
              className={
                syncPriceLabsReservationsMutation.isSuccess
                  ? classes.success
                  : classes.error
              }
            >
              {syncPriceLabsReservationsMessage}
            </Text>
            <Button
              onClick={() => {
                syncPriceLabsReservationsMutation.mutate({ id: listingId })
              }}
            >
              Sync reservations to PriceLabs
            </Button>
          </Stack>
        </>
      )}
    </>
  )
}

export default Review
