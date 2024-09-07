import { Card, Flex, Group, Image, Paper, Stack, Text } from '@mantine/core'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'

import VestaSpinnerOverlay from 'components/common/VestaSpinnerOverlay/VestaSpinnerOverlay'

import { api } from 'utils/api'

import { formatTimeWithZone } from 'utils/dateFormats'
import RevenueDisplay from 'components/revenue/RevenueDisplay/RevenueDisplay'

const SuccessPage = () => {
  const router = useRouter()
  const { id, key } = router.query

  const { data } = api.direct.getReservationByIdAndKey.useQuery(
    { id: id as string, key: key as string },
    { enabled: !!id }
  )
  const { data: orgData } = api.direct.getCurrentOrgByKey.useQuery(
    { key: key as string },
    { enabled: !!key }
  )

  return (
    <>
      <Flex p={32} gap={56}>
        <Stack miw={500}>
          <Group position="apart">
            {orgData?.logoUrl && (
              <Image
                maw={100}
                src={orgData?.logoUrl || ''}
                alt={`${orgData?.name || 'Company'} logo`}
              />
            )}
          </Group>
          <Group align="flex-start">
            <Card
              w={450}
              padding="xl"
              radius="lg"
              shadow="xs"
              withBorder
              sx={{ overflow: 'visible', position: 'relative' }}
            >
              <Stack>
                <Text fz="lg" fw={600}>
                  Payment success
                </Text>
                <Text>
                  Congratulations! Your payment has been successfully processed.
                </Text>
                <Paper bg="gray.2" p="sm" mb="sm">
                  <Text fz="sm" fw={600}>
                    Booking confirmation
                  </Text>
                  <Text fz="sm">
                    Your booking has been confirmed and is now fully reserved.
                    You can expect to receive a confirmation email with all the
                    details shortly.
                  </Text>
                </Paper>
              </Stack>
            </Card>
            <Card
              w={450}
              h="min-content"
              padding="xl"
              radius="lg"
              shadow="xs"
              withBorder
              sx={{ overflow: 'visible', position: 'relative' }}
            >
              {data ? (
                <Stack>
                  <Flex mb="sm" gap="md">
                    <Image
                      maw={100}
                      radius="md"
                      src={data.event?.listingPhoto}
                      alt="Primary property photo"
                    />
                    <Stack spacing="xs">
                      <Text fw={600}>{data.event?.listingName}</Text>
                      <Flex gap="md">
                        <Text>{data.event?.listingGuests} guests</Text>
                        <Text>
                          {data.event?.listingBeds}{' '}
                          {data.event?.listingBeds === 1 ? 'bed' : 'beds'}
                        </Text>
                        <Text>{data.event?.listingBaths} baths</Text>
                      </Flex>
                    </Stack>
                  </Flex>
                  <Group spacing="xs">
                    <Text fw={600}>Confirmation code</Text>
                    <Text>{data.event?.reservation?.confirmationCode}</Text>
                  </Group>
                  <Group spacing="xs" position="apart">
                    <div>
                      <Text fw={600}>Check-in</Text>
                      <Text>
                        {DateTime.fromJSDate(
                          data.event?.fromDate as Date
                        ).toFormat('MMM d yyyy')}
                      </Text>
                      <Text>
                        {formatTimeWithZone(
                          data.event?.fromDate as Date,
                          data.event?.listingTimeZone as string
                        )}
                      </Text>
                    </div>
                    <div>
                      <Text fw={600}>Checkout</Text>
                      <Text>
                        {DateTime.fromJSDate(
                          data.event?.toDate as Date
                        ).toFormat('MMM d yyyy')}
                      </Text>
                      <Text>
                        {formatTimeWithZone(
                          data.event?.toDate as Date,
                          data.event?.listingTimeZone as string
                        )}
                      </Text>
                    </div>
                  </Group>

                  {data.revenue && (
                    <RevenueDisplay
                      nights={parseInt(data.revenue.reservation.nights)}
                      rate={data?.revenue.revenue.accommodationRevenue.roomRate}
                      accommodationTotal={
                        data.revenue.revenue.accommodationRevenue.roomRateTotal
                          .amount
                      }
                      fees={data.revenue.revenue.guestFeeRevenue.guestFees.map(
                        (fee) => ({
                          name: fee.name,
                          value: fee.amount.amount,
                        })
                      )}
                      taxesTotal={data?.revenue?.revenue?.allTaxes.reduce(
                        (acc2, cur2) => acc2 + (cur2?.value.amount || 0),
                        0
                      )}
                      guestTotal={data.revenue.revenue.grossBookingValue.amount}
                    />
                  )}
                </Stack>
              ) : (
                <VestaSpinnerOverlay visible={true} />
              )}
            </Card>
          </Group>
        </Stack>
      </Flex>
    </>
  )
}
export default SuccessPage
