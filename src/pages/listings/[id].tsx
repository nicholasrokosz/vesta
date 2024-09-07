import { type NextPage } from 'next'
import {
  Title,
  Flex,
  Space,
  Text,
  Image,
  Skeleton,
  Button,
  Group,
  Tabs,
  Stack,
  createStyles,
  Modal,
  CopyButton,
} from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import { IconCheck, IconCopy, IconPencil } from '@tabler/icons-react'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import Breadcrumbs from 'components/nav/Breadcrumbs/Breadcrumbs'
import ListingCalendar from 'components/listings/ListingCalendar/ListingCalendar'
import InlineAddress from 'components/common/InlineAddress'
import { useCallback, useEffect, useState } from 'react'
import type { ICalendarEvent } from 'types/calendar'
import MessageTemplates from 'components/listings/MessageTemplates/MessageTemplates'
import { CreateEvent } from 'components/calendar'
import type { MbscPageLoadingEvent } from '@mobiscroll/react'
import DateString from 'types/dateString'

const useStyles = createStyles((theme) => ({
  label: {
    color: '#6A7181',
    fontSize: 14,
  },
  image: {
    height: '200px !important',
    width: '300px !important',
  },
  icon: {
    color: theme.colors.gray[8],
  },
}))

const ListingOverview: NextPage = () => {
  const { classes } = useStyles()
  const router = useRouter()
  const listingId = String(router.query.id) ?? '' // TODO: find out why type includes string[]

  const {
    data: listing,
    isLoading,
    isError,
  } = api.listing.getOne.useQuery({
    id: listingId,
  })

  const [dateRange, setDateRange] = useState<{
    startDateIso: string | null
    endDateIso: string | null
  }>({
    startDateIso: null,
    endDateIso: null,
  })

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = api.calendar.getAllByListing.useQuery(
    {
      id: listingId,
      start: dateRange.startDateIso,
      end: dateRange.endDateIso,
    },
    {
      enabled:
        !!listingId && !!dateRange.startDateIso && !!dateRange.endDateIso,
    }
  )

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const [mobiEvents, setMobiEvents] = useState<
    {
      start: Date
      end: Date
      event: ICalendarEvent
      resource: string
    }[]
  >([])
  const [pricesByDay, setPricesByDay] = useState<
    {
      start: DateString
      end: DateString
      event: ICalendarEvent | undefined
      resource: string
    }[]
  >([])

  useEffect(() => {
    if (!eventsData?.events || eventsLoading) return

    const listingEvents = eventsData.events.map((event: ICalendarEvent) => {
      return {
        start: event.fromDate,
        end: event.toDate,
        event: event,
        resource: event.listingId,
      }
    })

    const listingPricesByDay = eventsData.prices
      .map((price) => {
        const dateString = DateString.fromString(price.date)
        return {
          start: dateString,
          end: dateString,
          event: undefined,
          resource: `$${price.price}#${price.minStay}#`,
          listingId: price.listingId,
        }
      })
      .filter(
        (p) =>
          !eventsData.events.some(
            (e) =>
              e.listingId === p.listingId &&
              p.start.compareToDate(e.fromDate) >= 0 &&
              p.start.compareToDate(e.toDate) <= 0
          )
      )

    setPricesByDay(listingPricesByDay)
    setMobiEvents(listingEvents)
  }, [eventsData, eventsLoading])

  // TODO: make this code a utility and test it
  const checkExcluded = (date: Date) => {
    return mobiEvents.some((event) => {
      return (
        new Date(date.toDateString()) >= new Date(event.start.toDateString()) &&
        new Date(date.toDateString()) < new Date(event.end.toDateString())
      )
    })
  }

  useEffect(() => {
    if (!selectedDate) return
    if (checkExcluded(selectedDate)) return

    setSelectedDate(selectedDate)
  }, [selectedDate])

  const onDateRangeChange = useCallback((event: MbscPageLoadingEvent) => {
    const startDateIso = event.firstDay.toISOString().split('T')[0]
    const endDateIso = event.lastDay.toISOString().split('T')[0]

    setDateRange({ startDateIso, endDateIso })
  }, [])

  if (isLoading)
    return (
      <>
        <Skeleton height={50} width={500} radius="sm" mb={16} />
        <Flex>
          <Skeleton height={336} width={300} radius="sm" mr={16} />
          <Skeleton height={336} width={300} radius="sm" />
        </Flex>
        <Skeleton height={35} width={500} radius="sm" />
      </>
    )

  if (isError) return <p>Oops, something went wrong</p> // TODO: Create a proper error page

  return (
    <>
      <Group position="apart">
        <Breadcrumbs
          links={[
            { title: 'Listings', href: '/listings' },
            { title: listing?.name ?? 'Listing' },
          ]}
        />

        <Group spacing="xs">
          {listing?.iCalUrl && (
            <CopyButton value={listing?.iCalUrl}>
              {({ copied, copy }) => (
                <Button
                  onClick={copy}
                  leftIcon={copied ? <IconCheck /> : <IconCopy />}
                  variant="subtle"
                  color="gray.9"
                  fz="md"
                >
                  Copy iCal URL
                </Button>
              )}
            </CopyButton>
          )}
          <Button
            leftIcon={<IconPencil />}
            variant="subtle"
            color="gray.9"
            component="a"
            fz="md"
            href={`/listings/new/details/${listing?.id || ''}`}
          >
            Edit
          </Button>
        </Group>
      </Group>

      <Space h="lg" />
      <Flex direction={'row'} justify="flex-start">
        <Flex direction={'column'} maw={300}>
          <Carousel withIndicators dragFree slideGap="md" align="start">
            {listing?.content?.photos.map((_, i) => {
              return (
                <Carousel.Slide key={i} h={200} w={300}>
                  <Image
                    classNames={{ image: classes.image }}
                    fit="contain"
                    withPlaceholder
                    src={listing?.content?.photos[i] ?? ''}
                    alt={listing?.name ?? 'listing image'}
                    radius="sm"
                  />
                </Carousel.Slide>
              )
            })}
          </Carousel>
        </Flex>
        <Stack pl={16}>
          <Stack spacing={1}>
            <Group>
              <Title order={1}>{listing?.name}</Title>
            </Group>
            <Group spacing={4} className={classes.label}>
              <Text>{listing?.unitType}</Text>•
              {listing && <InlineAddress address={listing} size="lg" />}
            </Group>
          </Stack>

          <Stack spacing={8}>
            <Title order={6}>Property details</Title>
            <Stack spacing={1}>
              <Text className={classes.label}>Manager</Text>
              <Text>{listing?.propertyManager.name}</Text>
            </Stack>
            {listing?.propertyOwner && (
              <Stack spacing={1}>
                <Text className={classes.label}>Owner</Text>
                <Text>{listing.propertyOwner.name || 'N/A'}</Text>
              </Stack>
            )}
            {listing?.wifiName && (
              <Stack spacing={1}>
                <Text className={classes.label}>WiFi name</Text>
                <Text>{listing?.wifiName}</Text>
              </Stack>
            )}
            {listing?.wifiPassword && (
              <Stack spacing={1}>
                <Text className={classes.label}>WiFi password</Text>
                <Text>{listing?.wifiPassword}</Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Flex>

      <Space h="lg" />

      <Tabs defaultValue="calendar">
        <Tabs.List>
          <Tabs.Tab value="calendar" style={{ fontSize: '16px' }}>
            Calendar
          </Tabs.Tab>
          <Tabs.Tab value="templates" style={{ fontSize: '16px' }}>
            Message templates
          </Tabs.Tab>
        </Tabs.List>

        <Space h="lg" />

        <Tabs.Panel value="calendar">
          {/* {eventsData?.events && ( */}
          <>
            <Modal
              opened={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              size={700}
              title="Create new schedule"
            >
              <Stack h={500}>
                <CreateEvent
                  listingDate={[
                    listingId,
                    selectedDate
                      ? DateString.fromDate(selectedDate)
                      : undefined,
                  ]}
                  onComplete={() => {
                    setShowCreateModal(false)
                    setSelectedDate(undefined)
                    void refetchEvents()
                  }}
                />
              </Stack>
            </Modal>
            <ListingCalendar
              events={mobiEvents || []}
              prices={pricesByDay || []}
              onDateRangeChange={onDateRangeChange}
              onDateSelected={(date: Date) => {
                setSelectedDate(date)
                setShowCreateModal(true)
              }}
              onEventDeleted={() => void refetchEvents()}
            />
          </>
          {/* )} */}
        </Tabs.Panel>

        <Tabs.Panel value="templates">
          {listing?.messageTemplates && (
            <MessageTemplates
              templates={listing?.messageTemplates.map((t) => {
                return {
                  id: t.id,
                  title: t.title ?? '',
                  trigger: t.trigger ?? '',
                }
              })}
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </>
  )
}

export default ListingOverview
