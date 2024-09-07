import {
  Stack,
  NumberInput,
  Card,
  Text,
  Button,
  Flex,
  Anchor,
  Group,
  createStyles,
} from '@mantine/core'
import { api } from 'utils/api'
import { useState } from 'react'
import DirectRevenueEstimator from '../revenue/RevenueEstimator/DirectRevenueEstimator'
import CalendarEventDatePicker from '../calendar/CalendarEventDatePicker/CalendarEventDatePicker'
import { useRouter } from 'next/router'
import Info from '../common/Info/Info'
import DateString from 'types/dateString'

const useStyles = createStyles((theme) => ({
  error: {
    color: theme.colors.red[6],
  },
}))

const DirectBookingWidget = () => {
  const { classes } = useStyles()
  const [numberInputError, setNumberInputError] = useState<string | false>(
    false
  )

  const [adults, setAdults] = useState<number>(1)
  const [children, setChildren] = useState<number>(0)
  const [numGuests, setNumGuests] = useState<number>(1)
  const [pets, setPets] = useState<number>(0)
  const [selectedDates, setSelectedDates] = useState<
    [DateString | null, DateString | null]
  >([null, null])

  const router = useRouter()
  const key = router.query.key as string

  const { data: listing } = api.direct.getListingByKey.useQuery(
    { key: key },
    { enabled: !!key }
  )
  const { data: availabilityData } = api.direct.getBlockedDatesByKey.useQuery(
    { key: key },
    { enabled: !!key }
  )
  const { data: pricingData } = api.direct.getPricingByKey.useQuery(
    { key: key },
    { enabled: !!key }
  )
  const { data: feesData } = api.direct.getFeesForDirectBookingByKey.useQuery(
    {
      key: key,
      startDate: selectedDates[0]?.toString() ?? '',
      endDate: selectedDates[1]?.toString() ?? '',
      guests: numGuests,
      pets: pets > 0,
    },
    {
      enabled: !!key && !!selectedDates[0] && !!selectedDates[1] && !!adults,
    }
  )

  const petsAllowed = listing?.rules?.pets

  const setCheckTotalGuests = (numGuestsInputValue: number) => {
    setNumGuests(numGuestsInputValue)
    if (!listing) return
    if (numGuestsInputValue > listing.guests) {
      setNumberInputError('Too many guests')
    } else {
      setNumberInputError(false)
    }
  }

  const handleAdultsInput = (adultsInputValue: number) => {
    setAdults(adultsInputValue)
    const numGuestsInputValue = adultsInputValue + children
    setCheckTotalGuests(numGuestsInputValue)
  }

  const handleChildrenInput = (childrenInputValue: number) => {
    setChildren(childrenInputValue)
    const numGuestsInputValue = adults + childrenInputValue
    setCheckTotalGuests(numGuestsInputValue)
  }

  const inputsAreValid = !numberInputError && !selectedDates.includes(null)

  const determinePrice = () => {
    if (inputsAreValid) return pricingData ? `$${pricingData.minimum}` : '---'
    return listing ? `$${listing.basePrice}` : '---'
  }
  const prices = availabilityData?.prices.map((price) => ({
    date: DateString.fromString(price.date),
    price: price.price,
    minStay: price.minStay,
  }))

  return (
    <Card
      w={330}
      padding="xl"
      radius="lg"
      shadow="sm"
      withBorder
      sx={{ overflow: 'visible' }}
    >
      <Stack>
        <Flex align="end" gap={4}>
          <Text fz="xl" fw={700}>
            {determinePrice()}
          </Text>
          <Text fz="md" color="gray.6" sx={{ position: 'relative', bottom: 2 }}>
            / night
          </Text>
        </Flex>
        <Group spacing="xs" mb={0} pb={0}>
          <NumberInput
            label="Adults:"
            value={adults}
            onChange={handleAdultsInput}
            min={1}
            w={75}
            required
            error={numberInputError ? true : false}
            max={listing?.guests}
          />
          <NumberInput
            label="Children:"
            value={children}
            onChange={handleChildrenInput}
            min={0}
            w={75}
            required
            error={numberInputError ? true : false}
            max={listing?.guests}
          />
          <NumberInput
            label="Pets:"
            value={pets}
            onChange={(val) => setPets(parseInt(val as string))}
            min={0}
            w={75}
            disabled={!petsAllowed}
            mr={0}
          />
          {!petsAllowed && <Info label={'Pets not allowed'} />}
        </Group>
        {numberInputError && (
          <Text className={classes.error}>{numberInputError}</Text>
        )}

        <CalendarEventDatePicker
          blockedStartDates={availabilityData?.blockedCheckIn}
          blockedEndDates={availabilityData?.blockedCheckOut}
          prices={prices}
          disabled={false}
          onSetDates={setSelectedDates}
          startDate={selectedDates[0]}
          disableMinDate={false}
          disableMinStay={false}
        />
        {inputsAreValid ? (
          <>
            <Anchor
              // NOTE: href needs to begin with 'https://app.getvesta.io' in prod
              href={`/direct?key=${key ?? ''}&start=${
                selectedDates[0]?.toString() ?? ''
              }&end=${
                selectedDates[1]?.toString() ?? ''
              }&adults=${adults}&children=${children}&pets=${pets}`}
              target="_blank"
            >
              <Button w="100%" color="gray.9" size="md">
                Book now
              </Button>
            </Anchor>
            <DirectRevenueEstimator
              listingKey={key}
              dates={selectedDates as [DateString, DateString]}
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
            />
          </>
        ) : (
          <Button disabled={true} w="100%" color="gray.9" size="md">
            Book now
          </Button>
        )}
      </Stack>
    </Card>
  )
}

export default DirectBookingWidget
